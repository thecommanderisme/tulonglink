package com.tulonglink.backend.controller;

import com.tulonglink.backend.entity.PushToken;
import com.tulonglink.backend.entity.User;
import com.tulonglink.backend.repository.PushTokenRepository;
import com.tulonglink.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final PushTokenRepository pushTokenRepository;
    private final UserRepository userRepository;

    public NotificationController(
            PushTokenRepository pushTokenRepository,
            UserRepository userRepository) {
        this.pushTokenRepository = pushTokenRepository;
        this.userRepository = userRepository;
    }

    // Register push token for user
    @PostMapping("/register")
    public ResponseEntity<String> registerToken(
            @RequestBody Map<String, String> body,
            Authentication auth) {

        String token = body.get("token");
        if (token == null || token.isEmpty()) {
            throw new RuntimeException("Token is required");
        }

        Long userId = Long.parseLong(auth.getName());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Save token if it doesn't exist yet
        if (!pushTokenRepository.existsByToken(token)) {
            PushToken pushToken = PushToken.builder()
                    .user(user)
                    .token(token)
                    .build();
            pushTokenRepository.save(pushToken);
        }

        return ResponseEntity.ok("Token registered successfully");
    }
}