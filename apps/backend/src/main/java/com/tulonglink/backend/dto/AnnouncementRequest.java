package com.tulonglink.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AnnouncementRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String body;
    private String category;
    private String startsAt;
    private String expiresAt;
    private Long barangayId;
    private Long organizationId;
}