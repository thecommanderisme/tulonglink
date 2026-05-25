package com.tulonglink.backend.controller;

import com.tulonglink.backend.dto.ApplicationResponse;
import com.tulonglink.backend.dto.JobRequest;
import com.tulonglink.backend.dto.JobResponse;
import com.tulonglink.backend.service.JobService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;
import org.springframework.data.domain.Page;

@RestController
@RequestMapping("/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public ResponseEntity<Page<JobResponse>> getAllJobs(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String city,
            @RequestParam(defaultValue = "false") boolean showAll,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {

        Long userId = auth != null ? Long.parseLong(auth.getName()) : null;

        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(jobService.searchJobs(search, page, size, userId));
        }
        if (city != null && !city.isEmpty()) {
            return ResponseEntity.ok(jobService.getJobsByCity(city, page, size, userId));
        }
        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(jobService.getJobsByCategory(category, page, size, userId));
        }
        return ResponseEntity.ok(jobService.getAllJobs(page, size, userId, showAll));
    }

    @GetMapping("/my-applications")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(jobService.getMyApplications(userId));
    }

    @PatchMapping("/{id}/reopen")
    public ResponseEntity<String> reopenJob(
            @PathVariable Long id,
            Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        jobService.reopenJob(id, userId);
        return ResponseEntity.ok("Job reopened successfully");
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJob(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJob(id));
    }

    @PostMapping
    public ResponseEntity<JobResponse> createJob(
            @Valid @RequestBody JobRequest request,
            Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(jobService.createJob(request, userId));
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<String> applyForJob(
            @PathVariable Long id,
            Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(jobService.applyForJob(id, userId));
    }

    @DeleteMapping("/{id}/apply")
    public ResponseEntity<String> withdrawApplication(
            @PathVariable Long id,
            Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        jobService.withdrawApplication(id, userId);
        return ResponseEntity.ok("Application withdrawn successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteJob(
            @PathVariable Long id,
            Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        jobService.deleteJob(id, userId);
        return ResponseEntity.ok("Job deleted successfully");
    }

    @GetMapping("/{id}/applications")
    public ResponseEntity<List<ApplicationResponse>> getJobApplications(
            @PathVariable Long id,
            Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(jobService.getJobApplications(id, userId));
    }

    @PatchMapping("/{id}/applications/{applicationId}")
    public ResponseEntity<String> updateApplicationStatus(
            @PathVariable Long id,
            @PathVariable Long applicationId,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        jobService.updateApplicationStatus(applicationId, body.get("status"), userId);
        return ResponseEntity.ok("Application status updated");
    }

    @GetMapping("/my-posts")
    public ResponseEntity<List<JobResponse>> getMyPostedJobs(Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(jobService.getMyPostedJobs(userId));
    }

    @PatchMapping("/{id}/close")
    public ResponseEntity<String> closeJob(
            @PathVariable Long id,
            Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        jobService.closeJob(id, userId);
        return ResponseEntity.ok("Job closed successfully");
    }

    @PatchMapping("/{id}")
    public ResponseEntity<JobResponse> editJob(
            @PathVariable Long id,
            @RequestBody JobRequest request,
            Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(jobService.editJob(id, request, userId));
    }
}