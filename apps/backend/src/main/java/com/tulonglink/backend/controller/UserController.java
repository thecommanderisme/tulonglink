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
        @RequestBody Map<String, String> body,
        Authentication auth) {
    Long userId = Long.parseLong(auth.getName());
    userService.setBarangayByName(
        userId,
        body.get("barangayName"),
        body.get("cityName"),
        body.get("provinceName"),
        body.get("displayName")
    );
    return ResponseEntity.ok("Barangay updated successfully");
}

@GetMapping("/profile")
public ResponseEntity<?> getProfile(Authentication auth) {
    Long userId = Long.parseLong(auth.getName());
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    return ResponseEntity.ok(
        profileRepository.findByUserId(userId)
            .map(p -> Map.of(
                "barangayId", p.getBarangay() != null ? p.getBarangay().getId() : "",
                "barangayName", p.getBarangay() != null ? p.getBarangay().getName() : "",
                "displayName", p.getDisplayName() != null ? p.getDisplayName() : "",
                "skillsSummary", p.getSkillsSummary() != null ? p.getSkillsSummary() : "",
                "language", p.getLanguage() != null ? p.getLanguage() : "tl",
                "availability", p.getAvailability() != null ? p.getAvailability() : "",
                "email", user.getEmail() != null ? user.getEmail() : ""
            ))
            .orElse(Map.of(
                "email", user.getEmail() != null ? user.getEmail() : ""
            ))
    );
}

@PatchMapping("/profile")
public ResponseEntity<String> updateProfile(
        @RequestBody Map<String, String> body,
        Authentication auth) {
    Long userId = Long.parseLong(auth.getName());
    userService.updateProfile(
        userId,
        body.get("displayName"),
        body.get("skillsSummary"),
        body.get("language"),
        body.get("availability"),
        body.get("email")
    );
    return ResponseEntity.ok("Profile updated successfully");
}
}