package com.tulonglink.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ServiceCenterRequest {

    @NotBlank(message = "Category is required")
    private String category;

    private String address;
    private String contactInfo;
    private String hours;
    private String eligibilityNotes;
    private Long barangayId;
    private Long organizationId;
}