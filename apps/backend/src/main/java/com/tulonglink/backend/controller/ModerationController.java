package com.tulonglink.backend.controller;

import com.tulonglink.backend.dto.ModerationReportRequest;
import com.tulonglink.backend.entity.ModerationReport;
import com.tulonglink.backend.service.ModerationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/moderation")
public class ModerationController {

    private final ModerationService moderationService;

    public ModerationController(ModerationService moderationService) {
        this.moderationService = moderationService;
    }

    // POST /moderation/reports — submit a report
    @PostMapping("/reports")
    public ResponseEntity<ModerationReport> report(
            @Valid @RequestBody ModerationReportRequest request,
            Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(moderationService.report(request, userId));
    }

    // GET /moderation/reports — get pending reports (admin)
    @GetMapping("/reports")
    public ResponseEntity<List<ModerationReport>> getPending() {
        return ResponseEntity.ok(moderationService.getPendingReports());
    }

    // PATCH /moderation/reports/{id}/resolve — resolve a report (admin)
    @PatchMapping("/reports/{id}/resolve")
    public ResponseEntity<ModerationReport> resolve(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(moderationService.resolve(id, status));
    }
}