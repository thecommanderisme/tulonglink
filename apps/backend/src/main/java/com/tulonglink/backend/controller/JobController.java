package com.tulonglink.backend.controller;

import com.tulonglink.backend.dto.ApplicationResponse;
import com.tulonglink.backend.dto.JobRequest;
import com.tulonglink.backend.dto.JobResponse;
import com.tulonglink.backend.service.JobService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.tulonglink.backend.dto.ApplicationResponse;

import java.util.List;

@RestController
@RequestMapping("/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    // GET /jobs — get all jobs
    @GetMapping
    public ResponseEntity<List<JobResponse>> getAllJobs(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {

        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(jobService.searchJobs(search));
        }
        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(jobService.getJobsByCategory(category));
        }
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    @GetMapping("/my-applications")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(jobService.getMyApplications(userId));
    }

    // GET /jobs/{id} — get single job
    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJob(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJob(id));
    }

    // POST /jobs — create a job
    @PostMapping
    public ResponseEntity<JobResponse> createJob(
            @Valid @RequestBody JobRequest request,
            Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(jobService.createJob(request, userId));
    }

    // POST /jobs/{id}/apply — apply for a job
    @PostMapping("/{id}/apply")
    public ResponseEntity<String> applyForJob(
            @PathVariable Long id,
            Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(jobService.applyForJob(id, userId));
    }

    // DELETE /jobs/{id} — soft delete a job
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteJob(
            @PathVariable Long id,
            Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(jobService.deleteJob(id, userId));
    }
}