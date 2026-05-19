package com.tulonglink.backend.service;

import com.tulonglink.backend.dto.BarangayResponse;
import com.tulonglink.backend.entity.Barangay;
import com.tulonglink.backend.repository.BarangayRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BarangayService {

    private final BarangayRepository barangayRepository;

    public BarangayService(BarangayRepository barangayRepository) {
        this.barangayRepository = barangayRepository;
    }

    public List<BarangayResponse> getAll() {
        return barangayRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<BarangayResponse> getByCity(String city) {
        return barangayRepository.findByCityIgnoreCaseOrderByNameAsc(city)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<BarangayResponse> search(String keyword) {
        return barangayRepository.searchByName(keyword)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private BarangayResponse toResponse(Barangay b) {
        return BarangayResponse.builder()
                .id(b.getId())
                .name(b.getName())
                .city(b.getCity())
                .province(b.getProvince())
                .displayName(b.getName() + ", " + b.getCity())
                .build();
    }
}