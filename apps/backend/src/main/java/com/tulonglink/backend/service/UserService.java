package com.tulonglink.backend.service;

import com.tulonglink.backend.entity.Barangay;
import com.tulonglink.backend.entity.Profile;
import com.tulonglink.backend.entity.User;
import com.tulonglink.backend.repository.BarangayRepository;
import com.tulonglink.backend.repository.ProfileRepository;
import com.tulonglink.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final BarangayRepository barangayRepository;

    public UserService(
            UserRepository userRepository,
            ProfileRepository profileRepository,
            BarangayRepository barangayRepository) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.barangayRepository = barangayRepository;
    }

    public void setBarangay(Long userId, Long barangayId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Barangay barangay = barangayRepository.findById(barangayId)
                .orElseThrow(() -> new RuntimeException("Barangay not found"));

        Profile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> Profile.builder().user(user).build());

        profile.setBarangay(barangay);
        profileRepository.save(profile);
    }
}