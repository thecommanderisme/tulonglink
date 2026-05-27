package com.tulonglink.backend.service;

import com.google.firebase.auth.FirebaseAuth;
import com.tulonglink.backend.dto.AuthRequest;
import com.tulonglink.backend.dto.AuthResponse;
import com.tulonglink.backend.entity.RefreshToken;
import com.tulonglink.backend.entity.User;
import com.tulonglink.backend.repository.UserRepository;
import com.tulonglink.backend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final OtpService otpService;

    public AuthService(
            UserRepository userRepository,
            JwtUtil jwtUtil,
            PasswordEncoder passwordEncoder,
            RefreshTokenService refreshTokenService,
            OtpService otpService) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
        this.otpService = otpService;
    }

    // Register a new user
    public AuthResponse register(AuthRequest request) {
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone number already registered");
        }

        User.Role role = User.Role.RESIDENT;
        if (request.getRole() != null) {
            try {
                role = User.Role.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid role: " + request.getRole());
            }
        }

        User user = User.builder()
                .phone(request.getPhone())
                .email(request.getEmail())
                .role(role)
                .status("ACTIVE")
                .build();

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getId().toString(), saved.getRole().name());
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

        String token = jwtUtil.generateToken(user.getId().toString(), user.getRole().name());
        String refreshToken = refreshTokenService.createRefreshToken(user).getToken();
        return new AuthResponse(token, user.getRole().name(), user.getId(), "Login successful", refreshToken);
    }

    // Send OTP — generates OTP in Redis, Firebase handles SMS delivery on mobile
    public String sendOtp(String phone) {
        otpService.generateOtp(phone);
        return "OTP sent successfully";
    }

    // Verify OTP
    public AuthResponse verifyOtp(AuthRequest request) {
        boolean valid = otpService.verifyOtp(request.getPhone(), request.getOtp());

        if (!valid) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        User user = userRepository.findByPhone(request.getPhone())
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .phone(request.getPhone())
                            .role(User.Role.RESIDENT)
                            .status("ACTIVE")
                            .build();
                    return userRepository.save(newUser);
                });

        String token = jwtUtil.generateToken(user.getId().toString(), user.getRole().name());
        String refreshToken = refreshTokenService.createRefreshToken(user).getToken();
        return new AuthResponse(token, user.getRole().name(), user.getId(), "OTP verified successfully", refreshToken);
    }

    // Verify Firebase ID token and exchange for JWT
    public AuthResponse verifyFirebaseToken(String firebaseIdToken) {
        try {
            var decodedToken = FirebaseAuth.getInstance().verifyIdToken(firebaseIdToken);
            String phone = (String) decodedToken.getClaims().get("phone_number");

            if (phone == null) {
                throw new RuntimeException("No phone number in Firebase token");
            }

            // Normalize phone: Firebase returns +639XX, we store 09XX
            if (phone.startsWith("+63")) {
                phone = "0" + phone.substring(3);
            }

            String finalPhone = phone;
            User user = userRepository.findByPhone(finalPhone)
                    .orElseGet(() -> {
                        User newUser = User.builder()
                                .phone(finalPhone)
                                .role(User.Role.RESIDENT)
                                .status("ACTIVE")
                                .build();
                        return userRepository.save(newUser);
                    });

            String token = jwtUtil.generateToken(user.getId().toString(), user.getRole().name());
            String refreshToken = refreshTokenService.createRefreshToken(user).getToken();
            return new AuthResponse(token, user.getRole().name(), user.getId(), "Firebase auth successful", refreshToken);

        } catch (Exception e) {
            throw new RuntimeException("Invalid Firebase token: " + e.getMessage());
        }
    }

    // Refresh token
    public AuthResponse refresh(String refreshToken) {
        RefreshToken token = refreshTokenService.validateRefreshToken(refreshToken);
        User user = token.getUser();

        String newJwt = jwtUtil.generateToken(user.getId().toString(), user.getRole().name());
        String newRefreshToken = refreshTokenService.createRefreshToken(user).getToken();
        return new AuthResponse(newJwt, user.getRole().name(), user.getId(), "Token refreshed", newRefreshToken);
    }
}
