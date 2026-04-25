package com.tulonglink.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthRequest {

    @NotBlank(message = "Phone number is required")
    private String phone;

    private String email;

    private String password;

    private String otp;

    private String role;
}