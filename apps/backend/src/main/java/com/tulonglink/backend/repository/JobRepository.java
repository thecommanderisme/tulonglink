package com.tulonglink.backend.repository;

import com.tulonglink.backend.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    // Get all active jobs (not deleted)
    List<Job> findByDeletedAtIsNullOrderByCreatedAtDesc();

    // Filter by category
    List<Job> findByCategoryAndDeletedAtIsNullOrderByCreatedAtDesc(String category);

    // Filter by status
    List<Job> findByStatusAndDeletedAtIsNullOrderByCreatedAtDesc(String status);

    // Search by title keyword
    @Query("SELECT j FROM Job j WHERE j.deletedAt IS NULL AND LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Job> searchByTitle(String keyword);

    // Get jobs by barangay
    List<Job> findByBarangayIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long barangayId);
}