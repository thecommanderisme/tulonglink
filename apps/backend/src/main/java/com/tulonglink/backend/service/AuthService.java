package com.tulonglink.backend.service;

import com.tulonglink.backend.dto.AuthRequest;
import com.tulonglink.backend.dto.AuthResponse;
import com.tulonglink.backend.entity.RefreshToken;
import com.tulonglink.backend.entity.User;
import com.tulonglink.backend.repository.UserRepository;
import com.tulonglink.backend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;

    // Temporary in-memory OTP store (we'll move to Redis later)
    private final Map<String, String> otpStore = new HashMap<>();

    public AuthService(
            UserRepository userRepository,
            JwtUtil jwtUtil,
            PasswordEncoder passwordEncoder,
            RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
    }

    // Register a new user
    public AuthResponse register(AuthRequest request) {

        // Check if phone already exists
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone number already registered");
        }

        // Determine role - default to RESIDENT
        User.Role role = User.Role.RESIDENT;
        if (request.getRole() != null) {
            try {
                role = User.Role.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid role: " + request.getRole());
            }
        }

        // Build and save the user
        User user = User.builder()
                .phone(request.getPhone())
                .email(request.getEmail())
                .role(role)
                .status("ACTIVE")
                .build();

        User saved = userRepository.save(user);

        // Generate JWT token
        String token = jwtUtil.generateToken(
                saved.getId().toString(),
                saved.getRole().name()
        );

        String refreshToken = refreshTokenService.createRefreshToken(saved).getToken();
        return new AuthResponse(token, saved.getRole().name(), saved.getId(), "Registration successful", refreshToken);
    }

    // Login with phone
    public AuthResponse login(AuthRequest request) {

        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getStatus().equals("ACTIVE")) {
            throw new RuntimeException("Account is not active");
        }

        String token = jwtUtil.generateToken(
                user.getId().toString(),
                user.getRole().name()
        );

        String refreshToken = refreshTokenService.createRefreshToken(user).getToken();
        return new AuthResponse(token, user.getRole().name(), user.getId(), "Login successful", refreshToken);
    }

    // Generate and store OTP
    public String sendOtp(String phone) {

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));

        // Store it temporarily (phone → otp)
        otpStore.put(phone, otp);

        // TODO: Send via Semaphore PH SMS API
        // For now we return it directly for testing
        System.out.println("OTP for " + phone + ": " + otp);

        return "OTP sent successfully";
    }

    // Verify OTP and return JWT
    public AuthResponse verifyOtp(AuthRequest request) {

        String storedOtp = otpStore.get(request.getPhone());

        if (storedOtp == null || !storedOtp.equals(request.getOtp())) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        // Remove OTP after use
        otpStore.remove(request.getPhone());

        // Find or create user
        User user = userRepository.findByPhone(request.getPhone())
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .phone(request.getPhone())
                            .role(User.Role.RESIDENT)
                            .status("ACTIVE")
                            .build();
                    return userRepository.save(newUser);
                });

        String token = jwtUtil.generateToken(
                user.getId().toString(),
                user.getRole().name()
        );

        String refreshToken = refreshTokenService.createRefreshToken(user).getToken();
        return new AuthResponse(token, user.getRole().name(), user.getId(), "OTP verified successfully", refreshToken);
    }
    
    public AuthResponse refresh(String refreshToken) {
        RefreshToken token = refreshTokenService.validateRefreshToken(refreshToken);
        User user = token.getUser();

        String newJwt = jwtUtil.generateToken(
                user.getId().toString(),
                user.getRole().name()
        );

        String newRefreshToken = refreshTokenService.createRefreshToken(user).getToken();

        return new AuthResponse(newJwt, user.getRole().name(), user.getId(), "Token refreshed", newRefreshToken);
    }
}