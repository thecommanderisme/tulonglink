package com.tulonglink.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AuthRequest {

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^(09|\\+639)\\d{9}$", message = "Invalid Philippine phone number")
    private String phone;

    private String email;
    private String password;

    @Size(min = 6, max = 6, message = "OTP must be 6 digits")
    private String otp;

    private String role;
}
