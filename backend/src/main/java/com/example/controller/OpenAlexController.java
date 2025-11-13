package com.example.controller;

import com.example.service.OpenAlexService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/openalex")
public class OpenAlexController {

    private final OpenAlexService openAlexService;

    @Autowired
    public OpenAlexController(OpenAlexService openAlexService) {
        this.openAlexService = openAlexService;
    }

    @GetMapping("/work-types")
    @Operation(summary = "Get all work types from OpenAlex", description = "Returns a list of all distinct work types (e.g., 'article', 'book') from the OpenAlex group_by endpoint")
    public ResponseEntity<List<String>> getWorkTypes() {
        return ResponseEntity.ok(openAlexService.getWorkTypes());
    }
}