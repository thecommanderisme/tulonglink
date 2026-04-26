package com.tulonglink.backend.repository;

import com.tulonglink.backend.entity.ServiceCenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceCenterRepository extends JpaRepository<ServiceCenter, Long> {

    List<ServiceCenter> findByDeletedAtIsNullOrderByCreatedAtDesc();

    List<ServiceCenter> findByCategoryAndDeletedAtIsNullOrderByCreatedAtDesc(String category);
}