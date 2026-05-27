package com.tulonglink.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class JobRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String title;

    @Size(max = 50, message = "Category must not exceed 50 characters")
    private String category;

    @Size(max = 100, message = "Pay must not exceed 100 characters")
    private String pay;

    @Size(max = 255, message = "Location must not exceed 255 characters")
    private String location;

    private String dateNeeded;
    private Long barangayId;
    private Long organizationId;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @Size(max = 2000, message = "Requirements must not exceed 2000 characters")
    private String requirements;

    @Size(max = 255, message = "Work schedule must not exceed 255 characters")
    private String workSchedule;

    @Size(max = 50, message = "Work type must not exceed 50 characters")
    private String workType;

    @Size(max = 100, message = "Contact preference must not exceed 100 characters")
    private String contactPref;
}
