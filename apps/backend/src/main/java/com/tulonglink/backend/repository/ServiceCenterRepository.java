package com.tulonglink.backend.repository;

import com.tulonglink.backend.entity.ServiceCenter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceCenterRepository extends JpaRepository<ServiceCenter, Long> {

    Page<ServiceCenter> findByDeletedAtIsNullOrderByCreatedAtDesc(Pageable pageable);

    Page<ServiceCenter> findByCategoryAndDeletedAtIsNullOrderByCreatedAtDesc(String category, Pageable pageable);
}