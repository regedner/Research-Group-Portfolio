package com.example.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.example.model.YearCount;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class OpenAlexService {

    private static final Logger logger = LoggerFactory.getLogger(OpenAlexService.class);
    private final RestTemplate restTemplate;

    @Autowired
    public OpenAlexService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<String> getWorkTypes() {
        String url = "https://api.openalex.org/works?group_by=type";
        logger.info("Fetching work types from OpenAlex: {}", url);

        try {
            JsonNode response = restTemplate.getForObject(url, JsonNode.class);

            if (response != null && response.has("group_by")) {
                
                return StreamSupport.stream(response.get("group_by").spliterator(), false)
                        .map(node -> {
                            // DÜZELTME BURADA BAŞLIYOR
                            // 1. URL'yi al (örn: "https://openalex.org/types/reference-entry")
                            String typeUrl = node.path("key").asText(null);
                            
                            if (typeUrl == null || typeUrl.isEmpty()) {
                                return null;
                            }
                            
                            // 2. Sondaki '/' karakterini (varsa) kaldır
                            if (typeUrl.endsWith("/")) {
                                typeUrl = typeUrl.substring(0, typeUrl.length() - 1);
                            }
                            
                            // 3. Son '/' karakterinden sonrasını al (örn: "reference-entry")
                            return typeUrl.substring(typeUrl.lastIndexOf('/') + 1);
                            // DÜZELTME BURADA BİTİYOR
                        })
                        .filter(key -> key != null && !key.isEmpty()) // Hatalı veya boş olanları filtrele
                        .sorted()
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            logger.error("Failed to fetch work types from OpenAlex", e);
        }
        
        // Hata durumunda veya boş gelirse varsayılan bir liste döndür
        return List.of("article", "book", "other"); 
    }
    
    public List<YearCount> getWorksCountByYear(String openAlexId) {
        // Not: OpenAlex ID'si 'https://openalex.org/' önekini içermelidir
        String fullOpenAlexId = openAlexId.startsWith("https://") ? openAlexId : "https://openalex.org/" + openAlexId;
        
        String url = String.format(
            "https://api.openalex.org/works?filter=author.id:%s&group_by=publication_year", 
            fullOpenAlexId
        );
        logger.info("Fetching works count by year from OpenAlex: {}", url);

        try {
            JsonNode response = restTemplate.getForObject(url, JsonNode.class);

            if (response != null && response.has("group_by")) {
                return StreamSupport.stream(response.get("group_by").spliterator(), false)
                        .map(node -> new YearCount(
                                node.path("key").asText("Unknown"),
                                node.path("count").asInt(0)
                        ))
                        .filter(yc -> !yc.year().equals("Unknown")) // "Unknown" yılı filtrele
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            logger.error("Failed to fetch works count by year from OpenAlex", e);
        }
        
        return Collections.emptyList(); // Hata durumunda boş liste döndür
    }
}