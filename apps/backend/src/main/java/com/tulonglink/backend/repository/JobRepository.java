package com.tulonglink.backend.repository;

import com.tulonglink.backend.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    // All open jobs (default)
    @Query("SELECT j FROM Job j WHERE j.deletedAt IS NULL AND j.status = 'OPEN' AND (j.dateNeeded IS NULL OR j.dateNeeded > :now) ORDER BY j.createdAt DESC")
    Page<Job> findByDeletedAtIsNullOrderByCreatedAtDesc(Pageable pageable, LocalDateTime now);

    // All open jobs excluding own posts
    @Query("SELECT j FROM Job j WHERE j.deletedAt IS NULL AND j.status = 'OPEN' AND (j.dateNeeded IS NULL OR j.dateNeeded > :now) AND j.postedByUser.id != :userId ORDER BY j.createdAt DESC")
    Page<Job> findByDeletedAtIsNullAndNotPostedBy(Pageable pageable, LocalDateTime now, Long userId);

    // All jobs including closed/filled excluding own posts
    @Query("SELECT j FROM Job j WHERE j.deletedAt IS NULL AND (j.dateNeeded IS NULL OR j.dateNeeded > :now) AND j.postedByUser.id != :userId ORDER BY j.createdAt DESC")
    Page<Job> findAllJobsNotPostedBy(Pageable pageable, LocalDateTime now, Long userId);

    // Open jobs by category
    @Query("SELECT j FROM Job j WHERE j.deletedAt IS NULL AND j.status = 'OPEN' AND j.category = :category AND (j.dateNeeded IS NULL OR j.dateNeeded > :now) ORDER BY j.createdAt DESC")
    Page<Job> findByCategoryAndDeletedAtIsNullOrderByCreatedAtDesc(String category, Pageable pageable, LocalDateTime now);

    // Open jobs by category excluding own posts
    @Query("SELECT j FROM Job j WHERE j.deletedAt IS NULL AND j.status = 'OPEN' AND j.category = :category AND (j.dateNeeded IS NULL OR j.dateNeeded > :now) AND j.postedByUser.id != :userId ORDER BY j.createdAt DESC")
    Page<Job> findByCategoryAndDeletedAtIsNullAndNotPostedBy(String category, Pageable pageable, LocalDateTime now, Long userId);

    // Search open jobs
    @Query("SELECT j FROM Job j WHERE j.deletedAt IS NULL AND j.status = 'OPEN' AND LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Job> searchByTitle(String keyword, Pageable pageable);

    // Search open jobs excluding own posts
    @Query("SELECT j FROM Job j WHERE j.deletedAt IS NULL AND j.status = 'OPEN' AND LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) AND j.postedByUser.id != :userId")
    Page<Job> searchByTitleAndNotPostedBy(String keyword, Pageable pageable, Long userId);

    // Open jobs by city
    @Query("SELECT j FROM Job j WHERE j.deletedAt IS NULL AND j.status = 'OPEN' AND (j.dateNeeded IS NULL OR j.dateNeeded > :now) AND j.barangay.city = :city ORDER BY j.createdAt DESC")
    Page<Job> findByCity(String city, Pageable pageable, LocalDateTime now);

    // Open jobs by city excluding own posts
    @Query("SELECT j FROM Job j WHERE j.deletedAt IS NULL AND j.status = 'OPEN' AND (j.dateNeeded IS NULL OR j.dateNeeded > :now) AND j.barangay.city = :city AND j.postedByUser.id != :userId ORDER BY j.createdAt DESC")
    Page<Job> findByCityAndNotPostedBy(String city, Pageable pageable, LocalDateTime now, Long userId);

    // My posted jobs
    List<Job> findByPostedByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long userId);

    // Jobs by barangay
    List<Job> findByBarangayIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long barangayId);
}