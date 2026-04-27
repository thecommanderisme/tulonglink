package com.tulonglink.backend.repository;

import com.tulonglink.backend.entity.EmergencyContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, Long> {

    List<EmergencyContact> findAllByOrderByCategoryAsc();

    List<EmergencyContact> findByCategory(String category);

    List<EmergencyContact> findByBarangayId(Long barangayId);
}