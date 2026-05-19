package com.tulonglink.backend.controller;

import com.tulonglink.backend.dto.BarangayResponse;
import com.tulonglink.backend.service.BarangayService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/barangays")
public class BarangayController {

    private final BarangayService barangayService;

    public BarangayController(BarangayService barangayService) {
        this.barangayService = barangayService;
    }

    @GetMapping
    public ResponseEntity<List<BarangayResponse>> getAll(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String search) {
        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(barangayService.search(search));
        }
        if (city != null && !city.isEmpty()) {
            return ResponseEntity.ok(barangayService.getByCity(city));
        }
        return ResponseEntity.ok(barangayService.getAll());
    }
}