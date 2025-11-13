package com.example.provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class PublicationProviderFactory {

    private static final Logger logger = LoggerFactory.getLogger(PublicationProviderFactory.class);

    private final OpenAlexProvider openAlexProvider;
    private final SerpApiProvider serpApiProvider;

    public PublicationProviderFactory(OpenAlexProvider openAlexProvider, SerpApiProvider serpApiProvider) {
        this.openAlexProvider = openAlexProvider;
        this.serpApiProvider = serpApiProvider;
    }

    public PublicationProvider getProvider(String type) {
        logger.debug("Requested provider type: {}", type);
        logger.debug("Available providers - openalex: {}", openAlexProvider != null);
        logger.debug("Available providers - serpapi: {}", serpApiProvider != null);
        if ("openalex".equalsIgnoreCase(type)) {
            return openAlexProvider;
        } else if ("serpapi".equalsIgnoreCase(type)) {
            return serpApiProvider;
        }
        throw new IllegalArgumentException("Unsupported provider type: " + type);
    }
}