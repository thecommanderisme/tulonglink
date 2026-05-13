package com.tulonglink.backend.service;

import com.tulonglink.backend.dto.AnnouncementRequest;
import com.tulonglink.backend.dto.AnnouncementResponse;
import com.tulonglink.backend.entity.Announcement;
import com.tulonglink.backend.entity.User;
import com.tulonglink.backend.repository.AnnouncementRepository;
import com.tulonglink.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;

    public AnnouncementService(
            AnnouncementRepository announcementRepository,
            UserRepository userRepository) {
        this.announcementRepository = announcementRepository;
        this.userRepository = userRepository;
    }

    public Page<AnnouncementResponse> getActiveAnnouncements(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return announcementRepository.findActiveAnnouncements(LocalDateTime.now(), pageable)
                .map(this::toResponse);
    }

    public Page<AnnouncementResponse> getByCategory(String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return announcementRepository.findActiveByCategoryAndNotExpired(category, LocalDateTime.now(), pageable)
                .map(this::toResponse);
    }

    // Create announcement
    public AnnouncementResponse create(AnnouncementRequest request, Long userId) {
        Announcement announcement = Announcement.builder()
                .title(request.getTitle())
                .body(request.getBody())
                .category(request.getCategory())
                .verificationStatus("PENDING")
                .build();

        if (request.getExpiresAt() != null) {
            announcement.setExpiresAt(LocalDateTime.parse(request.getExpiresAt()));
        }

        Announcement saved = announcementRepository.save(announcement);
        return toResponse(saved);
    }

    // Soft delete
    public String delete(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));
        announcement.setDeletedAt(LocalDateTime.now());
        announcementRepository.save(announcement);
        return "Announcement deleted";
    }

    // Convert to response DTO
    private AnnouncementResponse toResponse(Announcement a) {
        return AnnouncementResponse.builder()
                .id(a.getId())
                .title(a.getTitle())
                .body(a.getBody())
                .category(a.getCategory())
                .verificationStatus(a.getVerificationStatus())
                .barangay(a.getBarangay() != null ? a.getBarangay().getName() : null)
                .organization(a.getOrganization() != null ? a.getOrganization().getName() : null)
                .startsAt(a.getStartsAt())
                .expiresAt(a.getExpiresAt())
                .createdAt(a.getCreatedAt())
                .build();
    }
}