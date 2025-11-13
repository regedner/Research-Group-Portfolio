package com.example.controller;

import com.example.model.Publication;
import com.example.service.PublicationService; // Bu servisi import ettiğinizden emin olun
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/publications")
public class PublicationController {

    @Autowired
    private PublicationService publicationService;

    @PutMapping("/{id}/tags")
    @Operation(summary = "Update tags for a publication", description = "Updates the list of tags for a specific publication")
    public ResponseEntity<Publication> updateTags(
            @PathVariable Long id,
            @RequestBody List<String> tags) {
        
        Publication updatedPublication = publicationService.updatePublicationTags(id, tags);
        
        return ResponseEntity.ok(updatedPublication);
    }
    
    @PutMapping("/{id}/type")
    @Operation(summary = "Update the type for a publication")
    public ResponseEntity<Publication> updateType(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) { // JSON { "type": "article" } gibi gelecek
        
        String type = payload.get("type");
        if (type == null) {
            throw new IllegalArgumentException("Payload must contain 'type' field.");
        }
        
        Publication updatedPublication = publicationService.updatePublicationType(id, type);
        return ResponseEntity.ok(updatedPublication);
    }
}