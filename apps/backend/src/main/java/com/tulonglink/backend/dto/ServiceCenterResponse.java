package com.tulonglink.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceCenterResponse {
    private Long id;
    private String category;
    private String address;
    private String contactInfo;
    private String hours;
    private String eligibilityNotes;
    private String barangay;
    private String organization;
}