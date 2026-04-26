package com.tulonglink.backend.controller;

import com.tulonglink.backend.dto.HelpRequestRequest;
import com.tulonglink.backend.dto.HelpRequestResponse;
import com.tulonglink.backend.service.HelpRequestService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/help-requests")
public class HelpRequestController {

    private final HelpRequestService helpRequestService;

    public HelpRequestController(HelpRequestService helpRequestService) {
        this.helpRequestService = helpRequestService;
    }

    // POST /help-requests — submit a request
    @PostMapping
    public ResponseEntity<HelpRequestResponse> create(
            @Valid @RequestBody HelpRequestRequest request,
            Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(helpRequestService.create(request, userId));
    }

    // GET /help-requests/public — get all public requests
    @GetMapping("/public")
    public ResponseEntity<List<HelpRequestResponse>> getPublic() {
        return ResponseEntity.ok(helpRequestService.getPublicRequests());
    }

    // GET /help-requests/mine — get my requests
    @GetMapping("/mine")
    public ResponseEntity<List<HelpRequestResponse>> getMine(Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(helpRequestService.getMyRequests(userId));
    }

    // PATCH /help-requests/{id}/status
    @PatchMapping("/{id}/status")
    public ResponseEntity<HelpRequestResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(helpRequestService.updateStatus(id, status));
    }

    // DELETE /help-requests/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return ResponseEntity.ok(helpRequestService.delete(id));
    }
}