package com.tulonglink.backend.repository;

import com.tulonglink.backend.entity.ModerationReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModerationReportRepository extends JpaRepository<ModerationReport, Long> {

    List<ModerationReport> findByStatusOrderByCreatedAtDesc(String status);

    List<ModerationReport> findByContentTypeAndContentId(String contentType, Long contentId);

    List<ModerationReport> findByReportedByIdOrderByCreatedAtDesc(Long userId);

    boolean existsByReportedByIdAndContentTypeAndContentId(
            Long userId, String contentType, Long contentId);
}