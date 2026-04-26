package com.tulonglink.backend.service;

import com.tulonglink.backend.dto.JobRequest;
import com.tulonglink.backend.dto.JobResponse;
import com.tulonglink.backend.entity.Job;
import com.tulonglink.backend.entity.JobApplication;
import com.tulonglink.backend.entity.User;
import com.tulonglink.backend.repository.JobApplicationRepository;
import com.tulonglink.backend.repository.JobRepository;
import com.tulonglink.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final UserRepository userRepository;

    public JobService(
            JobRepository jobRepository,
            JobApplicationRepository jobApplicationRepository,
            UserRepository userRepository) {
        this.jobRepository = jobRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.userRepository = userRepository;
    }

    // Get all jobs
    public List<JobResponse> getAllJobs() {
        return jobRepository.findByDeletedAtIsNullOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Get jobs by category
    public List<JobResponse> getJobsByCategory(String category) {
        return jobRepository.findByCategoryAndDeletedAtIsNullOrderByCreatedAtDesc(category)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Search jobs
    public List<JobResponse> searchJobs(String keyword) {
        return jobRepository.searchByTitle(keyword)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Get single job
    public JobResponse getJob(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        return toResponse(job);
    }

    // Post a new job
    public JobResponse createJob(JobRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Job job = Job.builder()
                .title(request.getTitle())
                .category(request.getCategory())
                .pay(request.getPay())
                .location(request.getLocation())
                .status("OPEN")
                .postedByUser(user)
                .build();

        Job saved = jobRepository.save(job);
        return toResponse(saved);
    }

    // Apply for a job
    public String applyForJob(Long jobId, Long userId) {
        // Check if job exists
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        // Check if already applied
        if (jobApplicationRepository.existsByJobIdAndUserId(jobId, userId)) {
            throw new RuntimeException("You have already applied for this job");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        JobApplication application = JobApplication.builder()
                .job(job)
                .user(user)
                .status("APPLIED")
                .build();

        jobApplicationRepository.save(application);
        return "Application submitted successfully";
    }

    // Soft delete a job
    public String deleteJob(Long jobId, Long userId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        job.setDeletedAt(LocalDateTime.now());
        jobRepository.save(job);
        return "Job deleted successfully";
    }

    // Get applications for a job
    public List<JobApplication> getApplications(Long jobId) {
        return jobApplicationRepository.findByJobId(jobId);
    }

    // Convert Job entity to JobResponse DTO
    private JobResponse toResponse(Job job) {
        int appCount = jobApplicationRepository.findByJobId(job.getId()).size();

        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .category(job.getCategory())
                .pay(job.getPay())
                .location(job.getLocation())
                .status(job.getStatus())
                .postedBy(job.getPostedByUser() != null ?
                        job.getPostedByUser().getPhone() : "Unknown")
                .barangay(job.getBarangay() != null ?
                        job.getBarangay().getName() : null)
                .createdAt(job.getCreatedAt())
                .applicationCount(appCount)
                .build();
    }
}