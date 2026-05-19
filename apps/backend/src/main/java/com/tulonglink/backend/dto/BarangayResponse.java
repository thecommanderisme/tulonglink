package com.tulonglink.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BarangayResponse {
    private Long id;
    private String name;
    private String city;
    private String province;
    private String displayName;
}