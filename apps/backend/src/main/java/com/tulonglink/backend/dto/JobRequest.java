package com.tulonglink.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JobRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String category;
    private String pay;
    private String location;
    private String dateNeeded;
    private Long barangayId;
    private Long organizationId;
    private String description;
    private String requirements;
    private String workSchedule;
}