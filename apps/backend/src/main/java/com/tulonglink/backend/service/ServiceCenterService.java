package com.tulonglink.backend.service;

import com.tulonglink.backend.dto.ServiceCenterRequest;
import com.tulonglink.backend.dto.ServiceCenterResponse;
import com.tulonglink.backend.entity.ServiceCenter;
import com.tulonglink.backend.repository.ServiceCenterRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@Service
public class ServiceCenterService {

    private final ServiceCenterRepository serviceCenterRepository;

    public ServiceCenterService(ServiceCenterRepository serviceCenterRepository) {
        this.serviceCenterRepository = serviceCenterRepository;
    }

    public Page<ServiceCenterResponse> getAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return serviceCenterRepository.findByDeletedAtIsNullOrderByCreatedAtDesc(pageable)
                .map(this::toResponse);
    }

    public Page<ServiceCenterResponse> getByCategory(String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return serviceCenterRepository.findByCategoryAndDeletedAtIsNullOrderByCreatedAtDesc(category, pageable)
                .map(this::toResponse);
    }

    public ServiceCenterResponse create(ServiceCenterRequest request) {
        ServiceCenter serviceCenter = ServiceCenter.builder()
                .category(request.getCategory())
                .address(request.getAddress())
                .contactInfo(request.getContactInfo())
                .hours(request.getHours())
                .eligibilityNotes(request.getEligibilityNotes())
                .build();

        ServiceCenter saved = serviceCenterRepository.save(serviceCenter);
        return toResponse(saved);
    }

    public String delete(Long id) {
        ServiceCenter serviceCenter = serviceCenterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service center not found"));
        serviceCenter.setDeletedAt(java.time.LocalDateTime.now());
        serviceCenterRepository.save(serviceCenter);
        return "Service center deleted";
    }

    private ServiceCenterResponse toResponse(ServiceCenter s) {
        return ServiceCenterResponse.builder()
                .id(s.getId())
                .category(s.getCategory())
                .address(s.getAddress())
                .contactInfo(s.getContactInfo())
                .hours(s.getHours())
                .eligibilityNotes(s.getEligibilityNotes())
                .barangay(s.getBarangay() != null ? s.getBarangay().getName() : null)
                .organization(s.getOrganization() != null ? s.getOrganization().getName() : null)
                .build();
    }
}