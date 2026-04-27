package com.tulonglink.backend.controller;

import com.tulonglink.backend.dto.EmergencyContactResponse;
import com.tulonglink.backend.entity.EmergencyContact;
import com.tulonglink.backend.service.EmergencyContactService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/emergency-contacts")
public class EmergencyContactController {

    private final EmergencyContactService emergencyContactService;

    public EmergencyContactController(EmergencyContactService emergencyContactService) {
        this.emergencyContactService = emergencyContactService;
    }

    // GET /emergency-contacts — public, no auth needed
    @GetMapping
    public ResponseEntity<List<EmergencyContactResponse>> getAll(
            @RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(emergencyContactService.getByCategory(category));
        }
        return ResponseEntity.ok(emergencyContactService.getAll());
    }

    // POST /emergency-contacts — admin only
    @PostMapping
    public ResponseEntity<EmergencyContactResponse> create(
            @RequestBody EmergencyContact request) {
        return ResponseEntity.ok(emergencyContactService.create(request));
    }

    // DELETE /emergency-contacts/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return ResponseEntity.ok(emergencyContactService.delete(id));
    }
}