package com.tulonglink.backend.service;

import com.tulonglink.backend.dto.EmergencyContactResponse;
import com.tulonglink.backend.entity.EmergencyContact;
import com.tulonglink.backend.repository.EmergencyContactRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmergencyContactService {

    private final EmergencyContactRepository emergencyContactRepository;

    public EmergencyContactService(EmergencyContactRepository emergencyContactRepository) {
        this.emergencyContactRepository = emergencyContactRepository;
    }

    public List<EmergencyContactResponse> getAll() {
        return emergencyContactRepository.findAllByOrderByCategoryAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<EmergencyContactResponse> getByCategory(String category) {
        return emergencyContactRepository.findByCategory(category)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public EmergencyContactResponse create(EmergencyContact request) {
        EmergencyContact saved = emergencyContactRepository.save(request);
        return toResponse(saved);
    }

    public String delete(Long id) {
        emergencyContactRepository.deleteById(id);
        return "Emergency contact deleted";
    }

    private EmergencyContactResponse toResponse(EmergencyContact e) {
        return EmergencyContactResponse.builder()
                .id(e.getId())
                .category(e.getCategory())
                .name(e.getName())
                .phone(e.getPhone())
                .barangay(e.getBarangay() != null ? e.getBarangay().getName() : null)
                .build();
    }
}