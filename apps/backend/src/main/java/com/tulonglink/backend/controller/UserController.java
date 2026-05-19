package com.tulonglink.backend.controller;

import com.tulonglink.backend.entity.User;
import com.tulonglink.backend.repository.UserRepository;
import com.tulonglink.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.tulonglink.backend.repository.ProfileRepository;

import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final ProfileRepository profileRepository;

    public UserController(
            UserRepository userRepository,
            UserService userService,
            ProfileRepository profileRepository) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.profileRepository = profileRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<User> getMe(Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    @PostMapping("/barangay")
    public ResponseEntity<String> setBarangay(
            @RequestBody Map<String, Long> body,
            Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        Long barangayId = body.get("barangayId");
        userService.setBarangay(userId, barangayId);
        return ResponseEntity.ok("Barangay updated successfully");
    }
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(
            profileRepository.findByUserId(userId)
                .map(p -> Map.of(
                    "barangayId", p.getBarangay() != null ? p.getBarangay().getId() : null,
                    "barangayName", p.getBarangay() != null ? p.getBarangay().getName() : null,
                    "displayName", p.getDisplayName() != null ? p.getDisplayName() : ""
                ))
                .orElse(Map.of())
        );
    }
}