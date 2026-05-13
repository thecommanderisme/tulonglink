package com.tulonglink.backend.controller;

import com.tulonglink.backend.dto.ServiceCenterRequest;
import com.tulonglink.backend.dto.ServiceCenterResponse;
import com.tulonglink.backend.service.ServiceCenterService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;

import java.util.List;

@RestController
@RequestMapping("/services")
public class ServiceCenterController {

    private final ServiceCenterService serviceCenterService;

    public ServiceCenterController(ServiceCenterService serviceCenterService) {
        this.serviceCenterService = serviceCenterService;
    }

    @GetMapping
    public ResponseEntity<Page<ServiceCenterResponse>> getAll(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(serviceCenterService.getByCategory(category, page, size));
        }
        return ResponseEntity.ok(serviceCenterService.getAll(page, size));
    }

    @PostMapping
    public ResponseEntity<ServiceCenterResponse> create(
            @Valid @RequestBody ServiceCenterRequest request) {
        return ResponseEntity.ok(serviceCenterService.create(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return ResponseEntity.ok(serviceCenterService.delete(id));
    }
}