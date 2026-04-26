package com.tulonglink.backend.controller;

import com.tulonglink.backend.dto.ServiceCenterRequest;
import com.tulonglink.backend.dto.ServiceCenterResponse;
import com.tulonglink.backend.service.ServiceCenterService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/services")
public class ServiceCenterController {

    private final ServiceCenterService serviceCenterService;

    public ServiceCenterController(ServiceCenterService serviceCenterService) {
        this.serviceCenterService = serviceCenterService;
    }

    @GetMapping
    public ResponseEntity<List<ServiceCenterResponse>> getAll(
            @RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(serviceCenterService.getByCategory(category));
        }
        return ResponseEntity.ok(serviceCenterService.getAll());
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