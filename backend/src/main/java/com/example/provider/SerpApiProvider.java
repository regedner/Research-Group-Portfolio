package com.example.provider;

import com.example.model.Member;
import com.example.model.Publication;
import com.example.model.YearCount; // YENİ: Grafik verisi için
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class SerpApiProvider implements PublicationProvider {

    private static final Logger logger = LoggerFactory.getLogger(SerpApiProvider.class);
    private static final int MAX_PAGES = 6;
    private static final int PER_PAGE = 20;
    private final RestTemplate restTemplate;

    @Value("${serpapi.api.key}")
    private String apiKey;
    
    // Yıl için daha esnek regex
    private static final Pattern YEAR_PATTERN = Pattern.compile("\\b(\\d{4})\\b");

    public SerpApiProvider(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public Member getMemberDetails(String scholarId) {
        scholarId = scholarId.trim();
        String url = String.format("https://serpapi.com/search.json?engine=google_scholar_author&author_id=%s&api_key=%s&hl=en", scholarId, apiKey);
        logger.info("Fetching member details for scholarId: {}", scholarId);

        Member member = new Member();
        try {
            JsonNode response = restTemplate.getForObject(url, JsonNode.class);
            logger.debug("SerpAPI getMemberDetails response: {}", response);

            if (response == null) {
                logger.error("Null response from SerpAPI for scholarId: {}", scholarId);
                return member;
            }

            if (response.has("error")) {
                logger.error("SerpAPI error for scholarId {}: {}", scholarId, response.get("error").asText());
                return member;
            }

            if (response.has("author")) {
                JsonNode author = response.get("author");
                member.setName(author.path("name").asText("Unknown Author"));
                member.setOpenAlexId(scholarId); // ScholarID'yi OpenAlexId yerine kullanıyoruz

                JsonNode citedBy = author.path("cited_by");
                int totalCitations = calculateTotalCitations(citedBy);
                member.setCitedByCount(totalCitations);
                logger.info("Extracted total citations for scholarId {}: {}", scholarId, totalCitations);
            } else {
                logger.warn("No 'author' field in response for scholarId: {}", scholarId);
            }
        } catch (HttpClientErrorException e) {
            logger.error("HTTP error fetching member details for scholarId {}: {}", scholarId, e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error fetching member details for scholarId {}: {}", scholarId, e.getMessage());
        }

        return member;
    }

    private int calculateTotalCitations(JsonNode citedBy) {
        int total = 0;
        if (citedBy != null && citedBy.has("table")) {
            for (JsonNode year : citedBy.get("table")) {
                total += year.path("citations").path("all").asInt(0);
            }
            logger.debug("Calculated total citations from table: {}", total);
        } else {
            logger.warn("No 'table' field in cited_by, returning 0 citations");
        }
        return total;
    }

    private Integer extractYearFromSummary(String summary) {
        if (summary == null || summary.isEmpty()) {
            logger.debug("Summary is null or empty");
            return null;
        }
        logger.debug("Parsing year from summary: {}", summary);
        Matcher matcher = YEAR_PATTERN.matcher(summary);
        if (matcher.find()) {
            String yearStr = matcher.group(1);
            try {
                int year = Integer.parseInt(yearStr);
                // Yılın mantıklı bir aralıkta olduğundan emin ol (örn: 1900-2030)
                if (year >= 1900 && year <= 2030) { 
                    logger.debug("Extracted year: {}", year);
                    return year;
                } else {
                    logger.warn("Invalid year found in summary: {} (out of range)", year);
                }
            } catch (NumberFormatException e) {
                logger.warn("Failed to parse year from summary: {}", yearStr);
            }
        } else {
            logger.warn("No year found in summary: {}", summary);
        }
        return null;
    }

    /**
     * YENİ METOT:
     * SerpAPI'den bir yazar için yıl bazlı atıf sayılarını (grafik için) çeker.
     * Not: Google Scholar 'yayın sayısı' değil, 'atıf sayısı' grafiği verir.
     */
    public List<YearCount> getMemberCountsByYear(String scholarId) {
        scholarId = scholarId.trim();
        String url = String.format("https://serpapi.com/search.json?engine=google_scholar_author&author_id=%s&api_key=%s&hl=en", scholarId, apiKey);
        logger.info("Fetching member counts by year for scholarId: {}", scholarId);
        List<YearCount> counts = new ArrayList<>();
        
        try {
            JsonNode response = restTemplate.getForObject(url, JsonNode.class);
            
            if (response == null || response.has("error") || !response.has("author")) {
                 logger.error("Error or no author field fetching counts for scholarId: {}", scholarId);
                 return counts;
            }
            
            // Google Scholar'ın 'cited_by.table' verisini (Yıllık Atıf Sayıları) al
            JsonNode citedByTable = response.path("author").path("cited_by").path("table");
            if (citedByTable.isArray()) {
                for (JsonNode yearNode : citedByTable) {
                    String year = yearNode.path("year").asText(null);
                    // Not: Bu 'count' yayın sayısı değil, 'atıf' sayısıdır.
                    int count = yearNode.path("citations").path("all").asInt(0); 
                    if (year != null) {
                        counts.add(new YearCount(year, count));
                    }
                }
            }
        } catch (Exception e) {
             logger.error("Error fetching member counts by year: {}", e.getMessage());
        }
        return counts;
    }

    /**
     * GÜNCELLENMİŞ METOT:
     * 'type', 'sourceName' alanlarını doldurur ve 'duplicate variable' hatasını düzeltir.
     */
    @Override
    public List<Publication> getPublications(String scholarId, Member member) {
        List<Publication> publications = new ArrayList<>();
        Set<String> seenTitles = new HashSet<>();
        Set<String> seenUrls = new HashSet<>();

        for (int page = 0; page < MAX_PAGES; page++) {
            int start = page * PER_PAGE;
            String url = String.format(
                "https://serpapi.com/search.json?engine=google_scholar&q=author:\"%s\"&api_key=%s&hl=en&start=%d&num=%d",
                member.getName(), apiKey, start, PER_PAGE
            );
            logger.info("Fetching publications for author '{}', page {}, start={}", member.getName(), page + 1, start);
            
            try {
                JsonNode response = restTemplate.getForObject(url, JsonNode.class);
                logger.debug("SerpAPI getPublications response: {}", response);

                if (response == null || response.has("error")) {
                    logger.error("Error fetching publications: {}", response != null ? response.get("error") : "null response");
                    break;
                }

                if (response.has("organic_results")) {
                    JsonNode articles = response.get("organic_results");
                    if (articles.size() == 0) {
                        logger.info("No more results for '{}', stopping pagination", member.getName());
                        break;
                    }

                    for (JsonNode article : articles) {
                        String title = article.path("title").asText("Untitled").trim();
                        String identifierUrl = article.path("link").asText(null);

                        if (title.isEmpty() || !seenTitles.add(title.toLowerCase())) {
                            continue;
                        }
                        if (identifierUrl == null || identifierUrl.isEmpty() || !seenUrls.add(identifierUrl.toLowerCase())) {
                            continue;
                        }

                        // 'type' (tür) alanını başlıktan tahmin et
                        String type = "article"; // Varsayılan
                        if (title.startsWith("[BOOK]")) {
                            type = "book";
                            title = title.substring(6).trim(); // Başlığı temizle
                        } else if (title.startsWith("[CITATION]")) {
                            type = "paratext"; 
                            title = title.substring(10).trim(); // Başlığı temizle
                        }

                        // Yazarları çek
                        String authors = article.path("publication_info").path("authors").isArray()
                            ?
                            article.path("publication_info").path("authors")
                                    .findValues("name")
                                    .stream()
                                    .map(node -> node.asText("Unknown Author"))
                                    .collect(Collectors.joining(", "))
                            : "Unknown Author";
                        if (authors.length() > 255) {
                            authors = authors.substring(0, 240) + "... ve diğerleri";
                        }

                        // DÜZELTME: Değişkenler burada BİR KEZ tanımlanmalı
                        Integer publicationYear = null;
                        String sourceName = null;
                        JsonNode pubInfo = article.path("publication_info");
                        String summary = pubInfo.path("summary").asText("");

                        // 1. Yılı Çek
                        if (pubInfo.has("year")) {
                            int yearVal = pubInfo.path("year").asInt(0);
                            publicationYear = yearVal > 0 ? yearVal : null;
                        } else if (!summary.isEmpty()) {
                            publicationYear = extractYearFromSummary(summary);
                        }
                        
                        // 2. Kaynak Adını (Source Name) Çek
                        if (!summary.isEmpty()) {
                            String tempSummary = summary;
                            
                            // Yazarları summary'den çıkar (eğer varsa)
                            if (authors.length() < 100 && tempSummary.startsWith(authors)) {
                                tempSummary = tempSummary.substring(authors.length()).trim();
                                if(tempSummary.startsWith("-")) {
                                    tempSummary = tempSummary.substring(1).trim();
                                }
                            }
                            
                            // Yılı summary'den çıkar (eğer bulduysak)
                            if (publicationYear != null) {
                                tempSummary = tempSummary.replace(publicationYear.toString(), "");
                            }
                            
                            // Kalanları temizle
                            tempSummary = tempSummary.replace("...", "").trim();
                            if (tempSummary.endsWith(",")) {
                                tempSummary = tempSummary.substring(0, tempSummary.length() - 1);
                            }
                            sourceName = tempSummary.trim();
                        }


                        Publication pub = new Publication();
                        pub.setTitle(title); // Temizlenmiş başlığı ata
                        pub.setIdentifierUrl(identifierUrl);
                        pub.setCitedByCount(article.path("inline_links").path("cited_by").path("total").asInt(0));
                        pub.setAuthors(authors);
                        pub.setPublicationYear(publicationYear);
                        pub.setMember(member);
                        
                        // Çekilen verileri ata
                        pub.setType(type);
                        pub.setSourceName(sourceName != null && !sourceName.isEmpty() ? sourceName : null);
                        pub.setTags(new ArrayList<>()); // SerpAPI etiket (tag) sağlamaz

                        publications.add(pub);
                    }
                } else {
                    logger.warn("No 'organic_results' field, stopping pagination");
                    break;
                }

            } catch (Exception e) {
                logger.error("Unexpected error fetching publications: {}", e.getMessage());
                break;
            }
        }

        logger.info("Fetched {} unique publications for '{}'", publications.size(), member.getName());
        return publications;
    }
}