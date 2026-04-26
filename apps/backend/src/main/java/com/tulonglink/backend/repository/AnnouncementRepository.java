package com.tulonglink.backend.repository;

import com.tulonglink.backend.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    // Get all active announcements (not deleted, not expired)
    @Query("SELECT a FROM Announcement a WHERE a.deletedAt IS NULL AND (a.expiresAt IS NULL OR a.expiresAt > :now) ORDER BY a.createdAt DESC")
    List<Announcement> findActiveAnnouncements(LocalDateTime now);

    // Get by category
    @Query("SELECT a FROM Announcement a WHERE a.deletedAt IS NULL AND a.category = :category AND (a.expiresAt IS NULL OR a.expiresAt > :now) ORDER BY a.createdAt DESC")
    List<Announcement> findActiveByCategoryAndNotExpired(String category, LocalDateTime now);

    // Get by barangay
    @Query("SELECT a FROM Announcement a WHERE a.deletedAt IS NULL AND a.barangay.id = :barangayId AND (a.expiresAt IS NULL OR a.expiresAt > :now) ORDER BY a.createdAt DESC")
    List<Announcement> findActiveByBarangay(Long barangayId, LocalDateTime now);
}