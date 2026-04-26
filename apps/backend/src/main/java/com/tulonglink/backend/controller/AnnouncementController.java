package com.tulonglink.backend.controller;

import com.tulonglink.backend.dto.AnnouncementRequest;
import com.tulonglink.backend.dto.AnnouncementResponse;
import com.tulonglink.backend.service.AnnouncementService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    // GET /announcements
    @GetMapping
    public ResponseEntity<List<AnnouncementResponse>> getAnnouncements(
            @RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(announcementService.getByCategory(category));
        }
        return ResponseEntity.ok(announcementService.getActiveAnnouncements());
    }

    // POST /announcements
    @PostMapping
    public ResponseEntity<AnnouncementResponse> create(
            @Valid @RequestBody AnnouncementRequest request,
            Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(announcementService.create(request, userId));
    }

    // DELETE /announcements/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(
            @PathVariable Long id,
            Authentication auth) {
        return ResponseEntity.ok(announcementService.delete(id));
    }
}