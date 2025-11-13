package com.example.controller;

import com.example.model.Member;
import com.example.model.Publication;
import com.example.model.Conference;
import com.example.service.MemberService;
import com.example.service.ConferenceService;
import com.example.model.YearCount;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Map;


@RestController
@RequestMapping("/api/members")
public class MemberController {

    private static final Logger logger = LoggerFactory.getLogger(MemberController.class);
    private static final String UPLOAD_DIR = "uploads/"; // Fotoğrafların kaydedileceği dizin

    private final MemberService memberService;
    private final ConferenceService conferenceService;

    public MemberController(MemberService memberService, ConferenceService conferenceService) {
        this.memberService = memberService;
        this.conferenceService = conferenceService;
        // Uploads dizinini oluştur
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
    }

    @GetMapping
    @Operation(summary = "Get all members", description = "Returns a paginated list of all members with optional sorting")
    public ResponseEntity<Page<Member>> getAllMembers(
            @Parameter(description = "Page number (default: 0)", required = false) @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (default: 10)", required = false) @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field (default: id)", required = false) @RequestParam(defaultValue = "id") String sort) {
        return ResponseEntity.ok(memberService.getAllMembers(page, size, sort));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a member by ID", description = "Returns the details of a single member")
    public ResponseEntity<Member> getMemberById(@Parameter(description = "Member ID", required = true) @PathVariable Long id) {
        Optional<Member> member = memberService.getMemberById(id);
        return member.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create a new member", description = "Adds a new member manually")
    public ResponseEntity<Member> createMember(@Parameter(description = "Member object to create", required = true) @Valid @RequestBody Member member) {
        return ResponseEntity.ok(memberService.saveMember(member));
    }

	@PutMapping("/{id}")
	@Operation(summary = "Update a member", description = "Updates an existing member by ID")
	public ResponseEntity<Member> updateMember(
	        @Parameter(description = "Member ID", required = true) @PathVariable Long id,
	        @Parameter(description = "Updated member object", required = true) @RequestBody Member member) {
	    
	    logger.info("Received update request for member ID: {} with data: {}", id, member);
	    
	    Member updated = memberService.updateMember(id, member);
	    return ResponseEntity.ok(updated);
	}

    @PostMapping("/{id}/upload-photo")
    @Operation(summary = "Upload a photo for a member", description = "Uploads a photo file for a member and updates their photo path")
    public ResponseEntity<Member> uploadPhoto(
            @Parameter(description = "Member ID", required = true) @PathVariable Long id,
            @Parameter(description = "Photo file to upload", required = true) @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            logger.error("No file uploaded for member ID: {}", id);
            return ResponseEntity.badRequest().build();
        }

        // Dosya validasyonu (sadece görüntü dosyaları)
        String contentType = file.getContentType();
        if (!contentType.equals("image/jpeg") && !contentType.equals("image/png")) {
            logger.error("Invalid file type for member ID: {}. Only JPEG/PNG allowed.", id);
            return ResponseEntity.badRequest().body(null);
        }

        // Dosya boyutu kontrolü (örneğin, 5MB sınırı)
        if (file.getSize() > 5 * 1024 * 1024) {
            logger.error("File size exceeds 5MB for member ID: {}", id);
            return ResponseEntity.badRequest().body(null);
        }

        try {
            // Benzersiz dosya adı oluştur
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR + fileName);
            Files.write(filePath, file.getBytes());
            logger.info("File uploaded successfully: {}", filePath);

            // Üye bilgisini güncelle
            Member updatedMember = memberService.updateMemberPhoto(id, fileName);
            return ResponseEntity.ok(updatedMember);
        } catch (IOException e) {
            logger.error("Failed to upload file for member ID: {}: {}", id, e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a member", description = "Deletes a member by ID")
    public ResponseEntity<Void> deleteMember(@Parameter(description = "Member ID", required = true) @PathVariable Long id) {
        memberService.deleteMember(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/fetch")
    @Operation(summary = "Fetch a member from external source", description = "Fetches and saves a member from OpenAlex or SerpAPI")
    public ResponseEntity<Member> fetchMember(
            @Parameter(description = "Source ID (e.g., OpenAlex or Google Scholar ID)", required = true) @RequestParam String sourceId,
            @Parameter(description = "Provider type (openalex or serpapi)", required = false) @RequestParam(defaultValue = "openalex") String providerType) {
        Member member = memberService.fetchAndSaveMember(sourceId, providerType);
        return ResponseEntity.ok(member);
    }

    @GetMapping("/{id}/publications")
    @Operation(summary = "Get publications by member", 
               description = "Returns a paginated list of publications of a member with optional sorting and filtering")
    public ResponseEntity<Page<Publication>> getPublicationsByMember(
            @Parameter(description = "Member ID", required = true) @PathVariable Long id,
            @Parameter(description = "Page number (default: 0)", required = false) @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (default: 10)", required = false) @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field", required = false) @RequestParam(defaultValue = "id") String sort,
            @Parameter(description = "Filter by types (optional)", required = false) @RequestParam(required = false) List<String> types,
            @Parameter(description = "Filter by tags (optional)", required = false) @RequestParam(required = false) List<String> tags) {
        
        if (!memberService.memberExists(id)) {
             return ResponseEntity.notFound().build();
        }
        
        // Servis metoduna filtreleri de yolla
        return ResponseEntity.ok(memberService.getPublicationsByMemberId(id, page, size, sort, types, tags));
    }
    
    @GetMapping("/{id}/publication-metadata")
    @Operation(summary = "Get publication filter metadata", description = "Returns all unique tags and types for a member's publications")
    public ResponseEntity<Map<String, List<String>>> getPublicationMetadata(
            @Parameter(description = "Member ID", required = true) @PathVariable Long id) {
        
        Map<String, List<String>> metadata = memberService.getPublicationMetadata(id);
        return ResponseEntity.ok(metadata);
    }

    @PostMapping("/{id}/publications")
    @Operation(summary = "Add a publication to a member", description = "Adds a new publication to an existing member")
    public ResponseEntity<Publication> addPublicationToMember(
            @Parameter(description = "Member ID", required = true) @PathVariable Long id,
            @Parameter(description = "Publication object to add", required = true) @Valid @RequestBody Publication publication) {
        return ResponseEntity.ok(memberService.addPublication(id, publication));
    }

    @GetMapping("/{id}/counts-by-year")
    @Operation(summary = "Get member's work counts by year", description = "Returns a list of work counts grouped by year for a specific member")
    public ResponseEntity<List<YearCount>> getMemberCountsByYear(
            @Parameter(description = "Member ID", required = true) @PathVariable Long id) {
        
        return ResponseEntity.ok(memberService.getMemberCountsByYear(id));
    }
    
    @GetMapping("/{id}/conferences")
    @Operation(summary = "Get conferences by member", description = "Returns all conferences of a member")
    public ResponseEntity<List<Conference>> getConferencesByMember(@Parameter(description = "Member ID", required = true) @PathVariable Long id) {
        if (!memberService.memberExists(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(conferenceService.getConferencesByMemberId(id));
    }

    @PostMapping("/{id}/conferences")
    @Operation(summary = "Add a conference to a member", description = "Adds a new conference to an existing member")
    public ResponseEntity<Conference> addConferenceToMember(
            @Parameter(description = "Member ID", required = true) @PathVariable Long id,
            @Parameter(description = "Conference object to add", required = true) @Valid @RequestBody Conference conference) {
        return ResponseEntity.ok(conferenceService.addConference(id, conference));
    }
}