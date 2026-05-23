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

    @Query("SELECT j FROM Job j WHERE j.deletedAt IS NULL AND (j.dateNeeded IS NULL OR j.dateNeeded > :now) ORDER BY j.createdAt DESC")
    Page<Job> findByDeletedAtIsNullOrderByCreatedAtDesc(Pageable pageable, LocalDateTime now);

    @Query("SELECT j FROM Job j WHERE j.deletedAt IS NULL AND j.category = :category AND (j.dateNeeded IS NULL OR j.dateNeeded > :now) ORDER BY j.createdAt DESC")
    Page<Job> findByCategoryAndDeletedAtIsNullOrderByCreatedAtDesc(String category, Pageable pageable, LocalDateTime now);

    @Query("SELECT j FROM Job j WHERE j.deletedAt IS NULL AND LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Job> searchByTitle(String keyword, Pageable pageable);

    List<Job> findByBarangayIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long barangayId);
}