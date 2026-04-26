package com.tulonglink.backend.service;

import com.tulonglink.backend.dto.HelpRequestRequest;
import com.tulonglink.backend.dto.HelpRequestResponse;
import com.tulonglink.backend.entity.HelpRequest;
import com.tulonglink.backend.entity.User;
import com.tulonglink.backend.repository.HelpRequestRepository;
import com.tulonglink.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HelpRequestService {

    private final HelpRequestRepository helpRequestRepository;
    private final UserRepository userRepository;

    public HelpRequestService(
            HelpRequestRepository helpRequestRepository,
            UserRepository userRepository) {
        this.helpRequestRepository = helpRequestRepository;
        this.userRepository = userRepository;
    }

    // Submit a help request
    public HelpRequestResponse create(HelpRequestRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        HelpRequest helpRequest = HelpRequest.builder()
                .user(user)
                .requestType(request.getRequestType())
                .summary(request.getSummary())
                .privacyLevel(request.getPrivacyLevel() != null ?
                        request.getPrivacyLevel() : "PUBLIC")
                .status("PENDING")
                .build();

        HelpRequest saved = helpRequestRepository.save(helpRequest);
        return toResponse(saved);
    }

    // Get all public help requests
    public List<HelpRequestResponse> getPublicRequests() {
        return helpRequestRepository
                .findByPrivacyLevelAndDeletedAtIsNullOrderByCreatedAtDesc("PUBLIC")
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Get my help requests
    public List<HelpRequestResponse> getMyRequests(Long userId) {
        return helpRequestRepository
                .findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Update status
    public HelpRequestResponse updateStatus(Long id, String status) {
        HelpRequest helpRequest = helpRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Help request not found"));
        helpRequest.setStatus(status);
        return toResponse(helpRequestRepository.save(helpRequest));
    }

    // Soft delete
    public String delete(Long id) {
        HelpRequest helpRequest = helpRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Help request not found"));
        helpRequest.setDeletedAt(LocalDateTime.now());
        helpRequestRepository.save(helpRequest);
        return "Help request deleted";
    }

    private HelpRequestResponse toResponse(HelpRequest h) {
        String requestedBy = "Anonymous";
        if (!h.getPrivacyLevel().equals("ANONYMOUS") && h.getUser() != null) {
            requestedBy = h.getUser().getPhone();
        }

        return HelpRequestResponse.builder()
                .id(h.getId())
                .requestType(h.getRequestType())
                .summary(h.getSummary())
                .privacyLevel(h.getPrivacyLevel())
                .status(h.getStatus())
                .requestedBy(requestedBy)
                .createdAt(h.getCreatedAt())
                .build();
    }
}