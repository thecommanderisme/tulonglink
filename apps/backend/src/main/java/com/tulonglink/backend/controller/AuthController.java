package com.tulonglink.backend.controller;

import com.tulonglink.backend.dto.AuthRequest;
import com.tulonglink.backend.dto.AuthResponse;
import com.tulonglink.backend.service.AuthService;
import com.tulonglink.backend.service.RefreshTokenService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;

    public AuthController(AuthService authService, RefreshTokenService refreshTokenService) {
        this.authService = authService;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.sendOtp(request.getPhone()));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.verifyOtp(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.refresh(body.get("refreshToken")));
    }

    @PostMapping("/verify-firebase")
    public ResponseEntity<AuthResponse> verifyFirebase(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.verifyFirebaseToken(body.get("firebaseToken")));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(Authentication auth) {
        if (auth != null) {
            Long userId = Long.parseLong(auth.getName());
            refreshTokenService.revokeAllUserTokens(userId);
        }
        return ResponseEntity.ok("Logged out successfully");
    }
}