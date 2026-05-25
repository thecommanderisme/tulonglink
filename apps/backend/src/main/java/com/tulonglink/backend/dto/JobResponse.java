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
    private String postedBy;         // display name or phone
    private String postedByPhone;    // employer phone (shown when hired)
    private Long postedById;
    private String barangay;
    private String city;             // for filtering
    private LocalDateTime createdAt;
    private int applicationCount;

    // Job details
    private String description;
    private String requirements;
    private String workSchedule;
    private LocalDateTime dateNeeded;
    private String workType;
    private String contactPref;
}