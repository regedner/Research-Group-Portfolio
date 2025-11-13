package com.example.service;

import com.example.model.Publication;
import com.example.repository.PublicationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Bu import'un olması gerekir

import java.util.List;

@Service
public class PublicationService {

    private static final Logger logger = LoggerFactory.getLogger(PublicationService.class);

    @Autowired
    private PublicationRepository publicationRepository;

    /**
     * Bir yayının etiket listesini günceller.
     */
    @Transactional
    public Publication updatePublicationTags(Long publicationId, List<String> tags) {
        logger.info("Updating tags for publication ID: {}", publicationId);

        // Yayını bul
        Publication publication = publicationRepository.findById(publicationId)
                .orElseThrow(() -> {
                    logger.error("Publication not found with ID: {}", publicationId);
                    return new IllegalArgumentException("Publication not found with ID: " + publicationId);
                });

        // Etiketleri güncelle (eski listeyi temizle, yenisini ekle)
        publication.getTags().clear();
        if (tags != null) {
            publication.getTags().addAll(tags);
        }

        // Değişiklikleri kaydet
        Publication savedPublication = publicationRepository.save(publication);
        logger.info("Successfully updated tags for publication ID: {}. New tag count: {}", 
                    savedPublication.getId(), savedPublication.getTags().size());
        
        return savedPublication;
    }

    /**
     * Bir yayının 'type' alanını günceller.
     * (Bir önceki hatayı düzelten eksik metot)
     */
    @Transactional
    public Publication updatePublicationType(Long publicationId, String type) {
        logger.info("Updating type for publication ID: {}", publicationId);

        Publication publication = publicationRepository.findById(publicationId)
                .orElseThrow(() -> {
                    logger.error("Publication not found with ID: {}", publicationId);
                    return new IllegalArgumentException("Publication not found with ID: " + publicationId);
                });

        // Türü güncelle
        publication.setType(type);

        Publication savedPublication = publicationRepository.save(publication);
        logger.info("Successfully updated type for publication ID: {}", savedPublication.getId());
        
        return savedPublication;
    }
}