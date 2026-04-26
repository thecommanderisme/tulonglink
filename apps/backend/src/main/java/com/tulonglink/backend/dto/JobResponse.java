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
public class JobResponse {
    private Long id;
    private String title;
    private String category;
    private String pay;
    private String location;
    private String status;
    private String postedBy;
    private String barangay;
    private LocalDateTime createdAt;
    private int applicationCount;
}