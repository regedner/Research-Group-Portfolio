package com.example.provider;

import com.example.model.Member;
import com.example.model.Publication;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class OpenAlexProvider implements PublicationProvider {

    private final RestTemplate restTemplate;

    public OpenAlexProvider(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public Member getMemberDetails(String openAlexId) {
        openAlexId = openAlexId.trim();
        String url = "https://api.openalex.org/people/" + openAlexId;
        JsonNode response = restTemplate.getForObject(url, JsonNode.class);

        Member member = new Member();
        if (response != null) {
            member.setName(response.path("display_name").asText(""));
            member.setOpenAlexId(openAlexId);
            member.setWorksCount(response.path("works_count").asInt(0));
            member.setCitedByCount(response.path("cited_by_count").asInt(0));
        }
        return member;
    }

    @Override
    public List<Publication> getPublications(String openAlexId, Member member) {
        openAlexId = openAlexId.trim();
        List<Publication> publications = new ArrayList<>();

        int page = 1;
        boolean hasMore = true;

        while (hasMore) {
            String worksUrl = "https://api.openalex.org/works?filter=author.id:https://openalex.org/"
                    + openAlexId + "&per-page=200&page=" + page;
            JsonNode worksData = restTemplate.getForObject(worksUrl, JsonNode.class);

            if (worksData != null && worksData.has("results")) {
                JsonNode results = worksData.get("results");
                if (results.size() == 0) {
                    hasMore = false;
                    break;
                }

                for (JsonNode work : results) {
                    String doi = work.path("doi").asText(null);
                    String landingPageUrl = work.path("primary_location").path("landing_page_url").asText(null);
                    
                    // DOI varsa onu kullan, yoksa landing_page_url kullan
                    String identifierUrl = (doi != null && !doi.isEmpty()) ? doi : landingPageUrl;

                    // identifierUrl yoksa, unique constraint hatası vermemek için ekleme
                    if (identifierUrl == null || identifierUrl.isEmpty()) {
                        continue;
                    }

                    // Yazarları çek ve 255 karaktere kırp
                    String authors = work.path("authorships").isArray()
                        ? work.path("authorships")
                              .findValues("author")
                              .stream()
                              .map(author -> author.path("display_name").asText("Unknown Author"))
                              .collect(Collectors.joining(", "))
                        : "Unknown Author";
                    if (authors.length() > 255) {
                        authors = authors.substring(0, 240) + "... ve diğerleri";
                    }

                    Publication pub = new Publication();
                    pub.setTitle(work.path("title").asText("Untitled"));
                    pub.setIdentifierUrl(identifierUrl);
                    pub.setCitedByCount(work.path("cited_by_count").asInt(0));
                    pub.setAuthors(authors);
                    pub.setPublicationYear(work.path("publication_year").asInt(0) > 0 ? work.path("publication_year").asInt() : null);
                    pub.setMember(member);
                    
                    String type = work.path("type").asText(null);
                    pub.setType(type);

                    String sourceName = work.path("primary_location")
                            .path("source")
                            .path("display_name")
                            .asText(null);
                    pub.setSourceName(sourceName);
    
                    if (work.hasNonNull("concepts")) {
                        List<String> concepts = StreamSupport.stream(work.get("concepts").spliterator(), false)
                                .filter(concept -> concept.path("level").asInt(99) <= 2) // Sadece ana konular (L0, L1, L2)
                                .map(concept -> concept.path("display_name").asText())
                                .filter(name -> name != null && !name.isEmpty())
                                .distinct() // Tekrar edenleri kaldır
                                .collect(Collectors.toList());
                        pub.setTags(concepts);
                    }

                    publications.add(pub);
                }
                page++;
            } else {
                hasMore = false;
            }
        }
        return publications;
    }
}