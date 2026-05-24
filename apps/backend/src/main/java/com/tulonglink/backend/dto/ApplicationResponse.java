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
public class ApplicationResponse {
    private Long id;
    private String status;
    private LocalDateTime appliedAt;
    private JobResponse job;

    // Applicant info (for employer view)
    private Long applicantId;
    private String applicantPhone;
}