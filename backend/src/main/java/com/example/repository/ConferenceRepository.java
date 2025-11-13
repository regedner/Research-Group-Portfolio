package com.example.repository;

import com.example.model.Conference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConferenceRepository extends JpaRepository<Conference, Long> {   
    List<Conference> findByMemberId(Long memberId);
    List<Conference> findByYear(Integer year);
}