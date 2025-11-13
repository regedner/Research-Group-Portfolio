package com.example.controller;

import com.example.model.Conference;
import com.example.service.ConferenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conferences")
public class ConferenceController {

    private static final Logger logger = LoggerFactory.getLogger(ConferenceController.class);

    private final ConferenceService conferenceService;

    public ConferenceController(ConferenceService conferenceService) {
        this.conferenceService = conferenceService;
    }

    // Tüm konferanslar (filtreleme ile)
    @GetMapping
    @Operation(summary = "Get all conferences", description = "Returns a list of all conferences with optional year filter")
    public ResponseEntity<List<Conference>> getAllConferences(
            @Parameter(description = "Filter by year (optional)", required = false) @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(conferenceService.getAllConferences(year));
    }

    // Konferans detayları
    @GetMapping("/{id}")
    @Operation(summary = "Get a conference by ID", description = "Returns the details of a single conference")
    public ResponseEntity<Conference> getConferenceById(@Parameter(description = "Conference ID", required = true) @PathVariable Long id) {
        return conferenceService.getConferenceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Konferans güncelle
    @PutMapping("/{id}")
    @Operation(summary = "Update a conference", description = "Updates an existing conference by ID")
    public ResponseEntity<Conference> updateConference(
            @Parameter(description = "Conference ID", required = true) @PathVariable Long id,
            @Parameter(description = "Updated conference object", required = true) @RequestBody Conference updated) {
        return ResponseEntity.ok(conferenceService.updateConference(id, updated));
    }

    // Konferans sil
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a conference", description = "Deletes a conference by ID")
    public ResponseEntity<Void> deleteConference(@Parameter(description = "Conference ID", required = true) @PathVariable Long id) {
        conferenceService.deleteConference(id);
        return ResponseEntity.noContent().build();
    }
}