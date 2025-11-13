package com.example.service;

import com.example.model.Conference;
import com.example.model.Member;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.repository.ConferenceRepository;
import com.example.repository.MemberRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ConferenceService {

    private static final Logger logger = LoggerFactory.getLogger(ConferenceService.class);

    @Autowired
    private ConferenceRepository conferenceRepository;
    
    @Autowired
    private MemberRepository memberRepository;

    /**
     * Yeni bir konferans ekler ve üyeyle ilişkilendirir
     */
    public Conference addConference(Long memberId, Conference conference) {
        logger.info("Adding conference '{}' for member ID: {}", conference.getName(), memberId);
        
        // Üye varlığını kontrol et
        if (!memberRepository.existsById(memberId)) {
            logger.error("Member not found with ID: {}", memberId);
            throw new IllegalArgumentException("Member not found with ID: " + memberId);
        }

        // Üye ile ilişkilendir
        Optional<Member> memberOpt = memberRepository.findById(memberId);
        conference.setMember(memberOpt.get());
        
        // Konferansı kaydet
        Conference savedConference = conferenceRepository.save(conference);
        logger.info("Successfully added conference ID: {} - '{}'", savedConference.getId(), savedConference.getName());
        return savedConference;
    }

    /**
     * Konferansı günceller (yalnızca dolu alanları günceller)
     */
    public Conference updateConference(Long conferenceId, Conference updatedConference) {
        logger.info("Updating conference ID: {}", conferenceId);
        
        // Konferans varlığını kontrol et
        Optional<Conference> existingOpt = conferenceRepository.findById(conferenceId);
        if (existingOpt.isEmpty()) {
            logger.error("Conference not found with ID: {}", conferenceId);
            throw new IllegalArgumentException("Conference not found with ID: " + conferenceId);
        }

        // Mevcut konferans bilgilerini güncelle (sadece dolu alanları)
        Conference existing = existingOpt.get();
        if (updatedConference.getName() != null && !updatedConference.getName().trim().isEmpty()) {
            existing.setName(updatedConference.getName());
        }
        if (updatedConference.getYear() > 0) {
            existing.setYear(updatedConference.getYear());
        }
        if (updatedConference.getLocation() != null && !updatedConference.getLocation().trim().isEmpty()) {
            existing.setLocation(updatedConference.getLocation());
        }
        if (updatedConference.getDescription() != null && !updatedConference.getDescription().trim().isEmpty()) {
            existing.setDescription(updatedConference.getDescription());
        }

        Conference savedConference = conferenceRepository.save(existing);
        logger.info("Successfully updated conference ID: {}", conferenceId);
        return savedConference;
    }

    /**
     * Konferansı siler
     */
    public void deleteConference(Long conferenceId) {
        logger.info("Deleting conference ID: {}", conferenceId);
        
        if (!conferenceRepository.existsById(conferenceId)) {
            logger.error("Conference not found with ID: {}", conferenceId);
            throw new IllegalArgumentException("Conference not found with ID: " + conferenceId);
        }

        conferenceRepository.deleteById(conferenceId);
        logger.info("Successfully deleted conference ID: {}", conferenceId);
    }

    /**
     * Üyenin konferanslarını getirir
     */
    public List<Conference> getConferencesByMemberId(Long memberId) {
        logger.info("Fetching conferences for member ID: {}", memberId);
        
        // Üye varlığını kontrol et
        if (!memberRepository.existsById(memberId)) {
            logger.error("Member not found with ID: {}", memberId);
            throw new IllegalArgumentException("Member not found with ID: " + memberId);
        }

        List<Conference> conferences = conferenceRepository.findByMemberId(memberId);
        logger.info("Found {} conferences for member ID: {}", conferences.size(), memberId);
        return conferences;
    }

    /**
     * Tüm konferansları getirir (isteğe bağlı yıl filtresi ile)
     */
    public List<Conference> getAllConferences(Integer year) {
        logger.info("Fetching all conferences with year filter: {}", year);
        if (year != null) {
            return conferenceRepository.findByYear(year);
        }
        List<Conference> conferences = conferenceRepository.findAll();
        logger.info("Found {} total conferences", conferences.size());
        return conferences;
    }

    /**
     * Konferans detaylarını ID ile getirir
     */
    public Optional<Conference> getConferenceById(Long conferenceId) {
        logger.info("Fetching conference ID: {}", conferenceId);
        return conferenceRepository.findById(conferenceId);
    }
}