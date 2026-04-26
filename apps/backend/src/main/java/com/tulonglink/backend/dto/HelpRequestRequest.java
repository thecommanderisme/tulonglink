package com.tulonglink.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class HelpRequestRequest {

    @NotBlank(message = "Request type is required")
    private String requestType;

    private String summary;
    private String privacyLevel; // PUBLIC, PRIVATE, ANONYMOUS
}