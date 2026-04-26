package com.tulonglink.backend.repository;

import com.tulonglink.backend.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    // Get all applications for a job
    List<JobApplication> findByJobId(Long jobId);

    // Get all applications by a user
    List<JobApplication> findByUserId(Long userId);

    // Check if user already applied
    boolean existsByJobIdAndUserId(Long jobId, Long userId);

    // Get specific application
    Optional<JobApplication> findByJobIdAndUserId(Long jobId, Long userId);
}