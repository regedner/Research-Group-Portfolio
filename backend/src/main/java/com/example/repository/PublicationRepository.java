package com.example.repository;

import com.example.model.Publication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor; 
import org.springframework.data.jpa.repository.Query; 
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
// JpaSpecificationExecutor'ı ekleyin
public interface PublicationRepository extends JpaRepository<Publication, Long>, JpaSpecificationExecutor<Publication> {
    
    List<Publication> findByMemberId(Long memberId);
    Page<Publication> findByMemberId(Long memberId, Pageable pageable);
    
    // Duplicate kontrolü için yeni metod
    Optional<Publication> findByIdentifierUrl(String identifierUrl);
    
    // Yıl ve citation count için sıralama
    Page<Publication> findByMemberIdOrderByPublicationYearDesc(Long memberId, Pageable pageable);
    Page<Publication> findByMemberIdOrderByCitedByCountDesc(Long memberId, Pageable pageable);
    Page<Publication> findByMemberIdOrderByPublicationYearAsc(Long memberId, Pageable pageable);
    Page<Publication> findByMemberIdOrderByCitedByCountAsc(Long memberId, Pageable pageable);

    @Query("SELECT DISTINCT t FROM Publication p JOIN p.tags t WHERE p.member.id = :memberId ORDER BY t")
    List<String> findDistinctTagsByMemberId(@Param("memberId") Long memberId);

    @Query("SELECT DISTINCT p.type FROM Publication p WHERE p.member.id = :memberId AND p.type IS NOT NULL ORDER BY p.type")
    List<String> findDistinctTypesByMemberId(@Param("memberId") Long memberId);
}