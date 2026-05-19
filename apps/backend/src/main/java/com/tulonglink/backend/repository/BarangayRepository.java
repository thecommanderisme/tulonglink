package com.tulonglink.backend.repository;

import com.tulonglink.backend.entity.Barangay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BarangayRepository extends JpaRepository<Barangay, Long> {

    List<Barangay> findAllByOrderByNameAsc();

    List<Barangay> findByCityIgnoreCaseOrderByNameAsc(String city);

    @Query("SELECT b FROM Barangay b WHERE LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(b.city) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Barangay> searchByName(String keyword);
}