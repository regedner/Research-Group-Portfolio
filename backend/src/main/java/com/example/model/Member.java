package com.example.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "member")
public class Member {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name", nullable = false)
    private String name = "Unknown";

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "photo_path")
    private String photoPath; // Yerel dosya yolu

    @Column(name = "open_alex_id", unique = true)
    private String openAlexId;
    
    @Column(name = "provider_type")
    private String providerType;
    
    @Column(name = "works_count", nullable = false)
    private int worksCount = 0;
    
    @Column(name = "cited_by_count", nullable = false)
    private int citedByCount = 0;

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Publication> publications = new ArrayList<>();

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Conference> conferences = new ArrayList<>();

    public Member() {
        this.name = "Unknown";
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name != null && !name.trim().isEmpty() ? name : "Unknown"; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPhotoPath() { return photoPath; }
    public void setPhotoPath(String photoPath) { this.photoPath = photoPath; }

    public String getOpenAlexId() { return openAlexId; }
    public void setOpenAlexId(String openAlexId) { this.openAlexId = openAlexId; }

    public String getProviderType() {
        return providerType;
    }
    public void setProviderType(String providerType) {
        this.providerType = providerType;
    }
    
    public int getWorksCount() { return worksCount; }
    public void setWorksCount(int worksCount) { this.worksCount = worksCount; }

    public int getCitedByCount() { return citedByCount; }
    public void setCitedByCount(int citedByCount) { this.citedByCount = citedByCount; }

    public List<Publication> getPublications() { 
        return publications != null ? publications : new ArrayList<>(); 
    }
    public void setPublications(List<Publication> publications) { 
        this.publications = publications != null ? publications : new ArrayList<>(); 
    }

    public List<Conference> getConferences() { 
        return conferences != null ? conferences : new ArrayList<>(); 
    }
    public void setConferences(List<Conference> conferences) { 
        this.conferences = conferences != null ? conferences : new ArrayList<>(); 
    }
}