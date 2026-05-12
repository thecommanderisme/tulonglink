package com.tulonglink.backend.service;

import com.tulonglink.backend.dto.ModerationReportRequest;
import com.tulonglink.backend.entity.ModerationReport;
import com.tulonglink.backend.entity.User;
import com.tulonglink.backend.repository.ModerationReportRepository;
import com.tulonglink.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ModerationService {

    private final ModerationReportRepository moderationReportRepository;
    private final UserRepository userRepository;

    public ModerationService(
            ModerationReportRepository moderationReportRepository,
            UserRepository userRepository) {
        this.moderationReportRepository = moderationReportRepository;
        this.userRepository = userRepository;
    }

    // Submit a report
    public ModerationReport report(ModerationReportRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if already reported
        if (moderationReportRepository.existsByReportedByIdAndContentTypeAndContentId(
                userId, request.getContentType(), request.getContentId())) {
            throw new RuntimeException("You have already reported this content");
        }

        ModerationReport report = ModerationReport.builder()
                .reportedBy(user)
                .contentType(request.getContentType())
                .contentId(request.getContentId())
                .reason(request.getReason())
                .details(request.getDetails())
                .status("PENDING")
                .build();

        return moderationReportRepository.save(report);
    }

    // Get all pending reports (admin only)
    public List<ModerationReport> getPendingReports() {
        return moderationReportRepository.findByStatusOrderByCreatedAtDesc("PENDING");
    }

    // Get all reports (admin only)
    public List<ModerationReport> getAllReports() {
        return moderationReportRepository.findByStatusOrderByCreatedAtDesc("PENDING");
    }

    // Resolve a report (admin only)
    public ModerationReport resolve(Long id, String status) {
        ModerationReport report = moderationReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setStatus(status);
        report.setResolvedAt(LocalDateTime.now());
        return moderationReportRepository.save(report);
    }
}