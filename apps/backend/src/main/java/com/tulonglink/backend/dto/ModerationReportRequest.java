package com.tulonglink.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ModerationReportRequest {

    @NotBlank(message = "Content type is required")
    private String contentType;

    @NotNull(message = "Content ID is required")
    private Long contentId;

    @NotBlank(message = "Reason is required")
    private String reason;

    private String details;
}