package com.example.service;

import com.example.model.Member;
import com.example.model.Publication;
import com.example.model.YearCount; // Grafik verisi için import
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.provider.PublicationProvider;
import com.example.provider.PublicationProviderFactory;
import com.example.provider.SerpApiProvider; // SerpAPI servisini import et
import com.example.repository.MemberRepository;
import com.example.repository.PublicationRepository;
import org.springframework.data.jpa.domain.Specification; 
import jakarta.persistence.criteria.Join; 
import jakarta.persistence.criteria.Predicate; 

import java.util.HashMap;
import java.util.Map; 
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors; // YENİ: Collectors importu

@Service
public class MemberService {

    private static final Logger logger = LoggerFactory.getLogger(MemberService.class);
    
    @Autowired
    private MemberRepository memberRepository;
    
    @Autowired
    private PublicationRepository publicationRepository;
    
    @Autowired
    private PublicationProviderFactory providerFactory;

    // Grafik servislerini inject et
    @Autowired
    private OpenAlexService openAlexService;

    // NOT: SerpApiProvider'ı (serpApiProvider) burada tutuyoruz
    // çünkü 'fetchAndSaveMember' içindeki 'getPublications' metodu
    // PublicationProvider interface'inde bulunmuyor olabilir.
    // (Eğer PublicationProvider'da getMemberCountsByYear olsaydı,
    // buna gerek kalmazdı, ama şu anki yapı için bu daha güvenli.)
    @Autowired
    private SerpApiProvider serpApiProvider;

    public PublicationProviderFactory getProviderFactory() {
        return providerFactory;
    }

    public Member saveMember(Member member) {
        logger.info("Saving new member: {}", member.getName());
        Member savedMember = memberRepository.save(member);
        logger.info("Successfully saved member ID: {}", savedMember.getId());
        return savedMember;
    }

    public Member updateMember(Long id, Member updatedMember) {
        logger.info("Updating member ID: {} with description length: {}",
                    id, updatedMember.getDescription() != null ? updatedMember.getDescription().length() : 0);
        
        Optional<Member> existingOpt = memberRepository.findById(id);
        if (existingOpt.isEmpty()) {
            logger.error("Member not found with ID: {}", id);
            throw new IllegalArgumentException("Member not found with ID: " + id);
        }

        Member existing = existingOpt.get();
        
        if (updatedMember.getDescription() != null) {
            existing.setDescription(updatedMember.getDescription());
            logger.info("Updated description for member ID: {}, new length: {}",
                        id, updatedMember.getDescription().length());
        }

        Member savedMember = memberRepository.save(existing);
        logger.info("Successfully saved member ID: {}", savedMember.getId());
        return savedMember;
    }

    public Member updateMemberPhoto(Long id, String fileName) {
        logger.info("Updating photo for member ID: {}", id);
        
        Optional<Member> existingOpt = memberRepository.findById(id);
        if (existingOpt.isEmpty()) {
            logger.error("Member not found with ID: {}", id);
            throw new IllegalArgumentException("Member not found with ID: " + id);
        }

        Member existing = existingOpt.get();
        existing.setPhotoPath(fileName);
        Member savedMember = memberRepository.save(existing);
        logger.info("Successfully updated photo for member ID: {}", id);
        return savedMember;
    }

    @Transactional
    public Member fetchAndSaveMember(String id, String providerType) {
        logger.info("Fetching member data for ID: {} using provider: {}", id, providerType);
        id = id.trim();
        Member existingMember = memberRepository.findByOpenAlexId(id);
        if (existingMember != null) {
            logger.info("Member with openAlexId: {} already exists, returning existing member", id);
            return existingMember;
        }

        PublicationProvider provider = providerFactory.getProvider(providerType);

        Member member = null;
        List<Publication> publications = List.of();

        int retries = 3;
        for (int attempt = 1; attempt <= retries; attempt++) {
            try {
                member = provider.getMemberDetails(id);
                Thread.sleep(600);
                publications = provider.getPublications(id, member);
                break;
            } catch (Exception e) {
                if (e.getMessage() != null && e.getMessage().contains("429")) {
                    logger.warn("Rate limit aşıldı (429). {}. deneme yapılacak...", attempt);
                    try {
                        Thread.sleep(2000 * attempt);
                    } catch (InterruptedException ignored) {}
                } else {
                    logger.error("Fetch error: {}", e.getMessage(), e);
                    throw new RuntimeException("Provider error: " + e.getMessage(), e);
                }
            }
        }

        if (member == null) {
            throw new RuntimeException("Member data alınamadı, tüm denemeler başarısız oldu.");
        }

        // GÜNCELLEME: Sağlayıcı türünü kaydet
        member.setProviderType(providerType);
        
        member.setPublications(new ArrayList<>());
        member.setWorksCount(0);
        member.setCitedByCount(0);
        
        Member savedMember = memberRepository.save(member);
        logger.info("Saved member: {} with ID: {}", savedMember.getName(), savedMember.getId());

        List<Publication> savedPublications = new ArrayList<>();
        int duplicateCount = 0;
        int totalCitations = 0;
        
        for (Publication pub : publications) {
            String url = pub.getIdentifierUrl();
            
            if (url == null || url.trim().isEmpty()) {
                logger.debug("Skipping publication with null/empty URL: {}", pub.getTitle());
                continue;
            }
            
            Optional<Publication> existingPub = publicationRepository.findByIdentifierUrl(url);
            if (existingPub.isPresent()) {
                duplicateCount++;
                logger.debug("Skipping duplicate publication URL: {}", url);
                continue;
            }
            
            pub.setMember(savedMember);
            
            try {
                Publication saved = publicationRepository.save(pub);
                savedPublications.add(saved);
                totalCitations += saved.getCitedByCount();
                logger.debug("Saved publication: {}", saved.getTitle());
            } catch (Exception e) {
                logger.error("Failed to save publication: {} - {}", pub.getTitle(), e.getMessage());
            }
        }

        savedMember.setWorksCount(savedPublications.size());
        savedMember.setCitedByCount(totalCitations);
        savedMember.setPublications(savedPublications);
        
        Member finalMember = memberRepository.save(savedMember);

        if (duplicateCount > 0) {
            logger.info("Filtered out {} duplicate publications for member: {}", duplicateCount, finalMember.getName());
        }

        logger.info("Successfully saved member: {} with {} unique publications (works: {}, citations: {}, {} duplicates filtered)",
                finalMember.getName(), savedPublications.size(), finalMember.getWorksCount(), 
                finalMember.getCitedByCount(), duplicateCount);

        return finalMember;
    }

    public Page<Member> getAllMembers(int page, int size, String sort) {
        logger.info("Fetching all members with page: {}, size: {}, sort: {}", page, size, sort);
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(sort));
        Page<Member> memberPage = memberRepository.findAll(pageRequest);
        logger.info("Found {} members in page {}", memberPage.getContent().size(), page);
        return memberPage;
    }

    public void deleteMember(Long id) {
        logger.info("Deleting member with ID: {}", id);
        memberRepository.deleteById(id);
        logger.info("Successfully deleted member ID: {}", id);
    }

    public Optional<Member> getMemberById(Long id) {
        logger.info("Fetching member details for ID: {}", id);
        return memberRepository.findById(id);
    }

    public Page<Publication> getPublicationsByMemberId(Long memberId, int page, int size, String sort, List<String> types, List<String> tags) {
        logger.info("Fetching publications for member ID: {}, page: {}, size: {}, sort: {}, types: {}, tags: {}", memberId, page, size, sort, types, tags);
        
        if (!memberRepository.existsById(memberId)) {
            logger.error("Member not found with ID: {}", memberId);
            throw new IllegalArgumentException("Member not found with ID: " + memberId);
        }
        
        PageRequest pageRequest;
        switch (sort) {
            case "publicationYear":
                pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publicationYear"));
                break;
            case "publicationYearAsc":
                pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "publicationYear"));
                break;
            case "citedByCount":
                pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "citedByCount"));
                break;
            case "citedByCountAsc":
                pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "citedByCount"));
                break;
            default:
                pageRequest = PageRequest.of(page, size, Sort.by("id"));
                break;
        }

        Specification<Publication> spec = createPublicationSpecification(memberId, types, tags);
        return publicationRepository.findAll(spec, pageRequest);
    }
    
    public Map<String, List<String>> getPublicationMetadata(Long memberId) {
        logger.info("Fetching publication metadata (tags, types) for member ID: {}", memberId);
        if (!memberRepository.existsById(memberId)) {
            logger.error("Member not found with ID: {}", memberId);
            throw new IllegalArgumentException("Member not found with ID: " + memberId);
        }
        
        List<String> tags = publicationRepository.findDistinctTagsByMemberId(memberId);
        List<String> types = publicationRepository.findDistinctTypesByMemberId(memberId);
        
        Map<String, List<String>> metadata = new HashMap<>();
        metadata.put("tags", tags);
        metadata.put("types", types);
        
        return metadata;
    }

    /**
     * GÜNCELLENMİŞ METOT
     * 'providerType'a göre grafik verisini çeker.
     * OpenAlex: API'den çeker (Yayın Sayısı).
     * SerpAPI: Veritabanındaki yayınları sayar (Yayın Sayısı).
     */
    public List<YearCount> getMemberCountsByYear(Long memberId) {
        logger.info("Fetching counts by year for member ID: {}", memberId);
        
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found with ID: " + memberId));

        String providerType = member.getProviderType();
        String sourceId = member.getOpenAlexId();

        if (sourceId == null || sourceId.trim().isEmpty()) {
            logger.warn("Member ID: {} has no Source ID, cannot fetch counts by year.", memberId);
            return Collections.emptyList();
        }

        // Hangi sağlayıcıyı kullanacağına karar ver
        if ("serpapi".equalsIgnoreCase(providerType)) {
            // DÜZELTME: SerpAPI için veritabanından yayınları say
            logger.info("Using DB (SerpAPI member) for member counts (ID: {})", sourceId);
            
            // 1. Üyenin tüm yayınlarını veritabanından çek
            List<Publication> pubs = publicationRepository.findByMemberId(memberId);
            
            // 2. Yıla göre grupla ve say (Java Streams kullanarak)
            return pubs.stream()
                .filter(p -> p.getPublicationYear() != null) // Bilinmeyen yılları filtrele
                .collect(Collectors.groupingBy(
                    p -> p.getPublicationYear().toString(), // Yıla göre grupla
                    Collectors.counting() // Her gruptakini say
                ))
                .entrySet().stream()
                // 3. YearCount formatına dönüştür
                .map(entry -> new YearCount(entry.getKey(), entry.getValue().intValue()))
                .collect(Collectors.toList());

        } else {
            // OpenAlex için mevcut API çağrısı (Bu zaten Yayın Sayısı döndürüyor)
            logger.info("Using OpenAlexService for member counts (ID: {})", sourceId);
            return openAlexService.getWorksCountByYear(sourceId);
        }
    }

    public Publication addPublication(Long memberId, Publication publication) {
        logger.info("Adding publication '{}' for member ID: {}", publication.getTitle(), memberId);
        if (!memberRepository.existsById(memberId)) {
            logger.error("Member not found with ID: {}", memberId);
            throw new IllegalArgumentException("Member not found with ID: " + memberId);
        }

        String url = publication.getIdentifierUrl();
        if (url != null && !url.trim().isEmpty()) {
            Optional<Publication> existingPub = publicationRepository.findByIdentifierUrl(url);
            if (existingPub.isPresent()) {
                logger.error("Publication with URL already exists: {}", url);
                throw new IllegalArgumentException("Publication with this URL already exists: " + url);
            }
        }

        Optional<Member> memberOpt = memberRepository.findById(memberId);
        publication.setMember(memberOpt.get());
        
        Publication savedPublication = publicationRepository.save(publication);
        logger.info("Successfully added publication ID: {} - '{}'", savedPublication.getId(), savedPublication.getTitle());
        return savedPublication;
    }

    public boolean memberExists(Long memberId) {
        return memberRepository.existsById(memberId);
    }
    
    private Specification<Publication> createPublicationSpecification(Long memberId, List<String> types, List<String> tags) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            predicates.add(cb.equal(root.get("member").get("id"), memberId));

            if (types != null && !types.isEmpty()) {
                predicates.add(root.get("type").in(types));
            }

            if (tags != null && !tags.isEmpty()) {
                Join<Publication, String> tagJoin = root.join("tags");
                predicates.add(tagJoin.in(tags));
                
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
    
}