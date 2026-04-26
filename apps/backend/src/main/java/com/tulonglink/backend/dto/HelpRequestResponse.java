package com.tulonglink.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HelpRequestResponse {
    private Long id;
    private String requestType;
    private String summary;
    private String privacyLevel;
    private String status;
    private String requestedBy;
    private LocalDateTime createdAt;
}