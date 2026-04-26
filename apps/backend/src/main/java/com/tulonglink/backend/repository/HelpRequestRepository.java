package com.tulonglink.backend.repository;

import com.tulonglink.backend.entity.HelpRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HelpRequestRepository extends JpaRepository<HelpRequest, Long> {

    // Get all active help requests
    List<HelpRequest> findByDeletedAtIsNullOrderByCreatedAtDesc();

    // Get by user
    List<HelpRequest> findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long userId);

    // Get by status
    List<HelpRequest> findByStatusAndDeletedAtIsNullOrderByCreatedAtDesc(String status);

    // Get public requests only
    List<HelpRequest> findByPrivacyLevelAndDeletedAtIsNullOrderByCreatedAtDesc(String privacyLevel);
}