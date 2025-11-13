package com.example.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "publication", uniqueConstraints = @UniqueConstraint(columnNames = {"identifier_url"}))
public class Publication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "identifier_url", unique = true)
    private String identifierUrl;

    @Column(name = "cited_by_count")
    private int citedByCount = 0;

    @Column(name = "authors", columnDefinition = "TEXT")
    private String authors; // Yazarlar, TEXT olarak
    
    @Column(name = "source_name", columnDefinition = "TEXT")
    private String sourceName;

    @Column(name = "publication_year")
    private Integer publicationYear; // Yayın yılı
    

    @Column(name = "type")
    private String type;


    // @ElementCollection, bu listeyi ayrı bir 'publication_tags' tablosunda tutar
    @ElementCollection(fetch = FetchType.EAGER) // Eager yüklüyoruz ki JSON'da direkt gitsin
    @CollectionTable(name = "publication_tags", joinColumns = @JoinColumn(name = "publication_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "member_id")
    @JsonBackReference
    private Member member;

    public Publication() {
        this.title = "Untitled";
        this.authors = "Unknown Author";
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title != null && !title.trim().isEmpty() ? title : "Untitled"; }

    public String getIdentifierUrl() { return identifierUrl; }
    public void setIdentifierUrl(String identifierUrl) { 
        this.identifierUrl = identifierUrl != null && !identifierUrl.trim().isEmpty() ? identifierUrl : null; 
    }

    public int getCitedByCount() { return citedByCount; }
    public void setCitedByCount(int citedByCount) { this.citedByCount = citedByCount; }

    public String getAuthors() { return authors; }
    public void setAuthors(String authors) { this.authors = authors != null && !authors.trim().isEmpty() ? authors : "Unknown Author"; }

    public Integer getPublicationYear() { return publicationYear; }
    public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear != null && publicationYear > 0 ? publicationYear : null; }

    public Member getMember() { return member; }
    public void setMember(Member member) { this.member = member; }
    
    public String getSourceName() {
        return sourceName;
    }

    public void setSourceName(String sourceName) {
        this.sourceName = sourceName;
    }
    
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }
}