package com.tulonglink.backend.service;

import com.tulonglink.backend.dto.ApplicationResponse;
import com.tulonglink.backend.dto.JobRequest;
import com.tulonglink.backend.dto.JobResponse;
import com.tulonglink.backend.entity.Job;
import com.tulonglink.backend.entity.JobApplication;
import com.tulonglink.backend.entity.User;
import com.tulonglink.backend.repository.JobApplicationRepository;
import com.tulonglink.backend.repository.JobRepository;
import com.tulonglink.backend.repository.ProfileRepository;
import com.tulonglink.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;

    public JobService(
            JobRepository jobRepository,
            JobApplicationRepository jobApplicationRepository,
            UserRepository userRepository,
            ProfileRepository profileRepository) {
        this.jobRepository = jobRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
    }

    public Page<JobResponse> getAllJobs(int page, int size, Long userId, boolean showAll) {
        Pageable pageable = PageRequest.of(page, size);
        if (showAll) {
            // Show all including closed/filled
            return jobRepository.findAllJobsNotPostedBy(pageable, LocalDateTime.now(), userId)
                    .map(this::toResponse);
        }
        if (userId != null) {
            return jobRepository.findByDeletedAtIsNullAndNotPostedBy(pageable, LocalDateTime.now(), userId)
                    .map(this::toResponse);
        }
        return jobRepository.findByDeletedAtIsNullOrderByCreatedAtDesc(pageable, LocalDateTime.now())
                .map(this::toResponse);
    }

    public Page<JobResponse> getJobsByCategory(String category, int page, int size, Long userId) {
        Pageable pageable = PageRequest.of(page, size);
        if (userId != null) {
            return jobRepository.findByCategoryAndDeletedAtIsNullAndNotPostedBy(category, pageable, LocalDateTime.now(), userId)
                    .map(this::toResponse);
        }
        return jobRepository.findByCategoryAndDeletedAtIsNullOrderByCreatedAtDesc(category, pageable, LocalDateTime.now())
                .map(this::toResponse);
    }

    public Page<JobResponse> searchJobs(String keyword, int page, int size, Long userId) {
        Pageable pageable = PageRequest.of(page, size);
        if (userId != null) {
            return jobRepository.searchByTitleAndNotPostedBy(keyword, pageable, userId)
                    .map(this::toResponse);
        }
        return jobRepository.searchByTitle(keyword, pageable)
                .map(this::toResponse);
    }

    public Page<JobResponse> getJobsByCity(String city, int page, int size, Long userId) {
        Pageable pageable = PageRequest.of(page, size);
        if (userId != null) {
            return jobRepository.findByCityAndNotPostedBy(city, pageable, LocalDateTime.now(), userId)
                    .map(this::toResponse);
        }
        return jobRepository.findByCity(city, pageable, LocalDateTime.now())
                .map(this::toResponse);
    }

    public JobResponse getJob(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        return toResponse(job);
    }

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

        if (request.getDateNeeded() != null && !request.getDateNeeded().isEmpty()) {
            try {
                job.setDateNeeded(LocalDateTime.parse(request.getDateNeeded(),
                        DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            } catch (Exception e) {
                try {
                    job.setDateNeeded(LocalDateTime.parse(
                            request.getDateNeeded() + "T23:59:59",
                            DateTimeFormatter.ISO_LOCAL_DATE_TIME));
                } catch (Exception ex) {
                    System.out.println("Could not parse dateNeeded: " + request.getDateNeeded());
                }
            }
        }

        if (request.getBarangayId() != null) {
            var barangay = new com.tulonglink.backend.entity.Barangay();
            barangay.setId(request.getBarangayId());
            job.setBarangay(barangay);
        }

        if (request.getDescription() != null) job.setDescription(request.getDescription());
        if (request.getRequirements() != null) job.setRequirements(request.getRequirements());
        if (request.getWorkSchedule() != null) job.setWorkSchedule(request.getWorkSchedule());

        Job saved = jobRepository.save(job);
        return toResponse(saved);
    }

    public List<ApplicationResponse> getMyApplications(Long userId) {
        return jobApplicationRepository.findByUserId(userId)
                .stream()
                .map(app -> ApplicationResponse.builder()
                        .id(app.getId())
                        .status(app.getStatus())
                        .appliedAt(app.getAppliedAt())
                        .job(toResponse(app.getJob()))
                        .build())
                .collect(Collectors.toList());
    }

    public String applyForJob(Long jobId, Long userId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (job.getPostedByUser().getId().equals(userId)) {
            throw new RuntimeException("Hindi ka makapag-apply sa sarili mong job post");
        }

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

    public void withdrawApplication(Long jobId, Long userId) {
        JobApplication application = jobApplicationRepository
                .findByJobIdAndUserId(jobId, userId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!application.getStatus().equals("APPLIED")) {
            throw new RuntimeException("Hindi na mababawi ang application na ito");
        }

        jobApplicationRepository.delete(application);
    }

    public void closeJob(Long jobId, Long userId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getPostedByUser().getId().equals(userId)) {
            throw new RuntimeException("You can only close your own jobs");
        }

        job.setStatus("CLOSED");
        jobRepository.save(job);
    }

    public JobResponse editJob(Long jobId, JobRequest request, Long userId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getPostedByUser().getId().equals(userId)) {
            throw new RuntimeException("You can only edit your own jobs");
        }

        if (request.getTitle() != null) job.setTitle(request.getTitle());
        if (request.getCategory() != null) job.setCategory(request.getCategory());
        if (request.getPay() != null) job.setPay(request.getPay());
        if (request.getLocation() != null) job.setLocation(request.getLocation());
        if (request.getDescription() != null) job.setDescription(request.getDescription());
        if (request.getRequirements() != null) job.setRequirements(request.getRequirements());
        if (request.getWorkSchedule() != null) job.setWorkSchedule(request.getWorkSchedule());
        if (request.getDateNeeded() != null && !request.getDateNeeded().isEmpty()) {
            try {
                job.setDateNeeded(LocalDateTime.parse(request.getDateNeeded(),
                        DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            } catch (Exception e) {
                try {
                    job.setDateNeeded(LocalDateTime.parse(
                            request.getDateNeeded() + "T23:59:59",
                            DateTimeFormatter.ISO_LOCAL_DATE_TIME));
                } catch (Exception ex) {
                    System.out.println("Could not parse dateNeeded: " + request.getDateNeeded());
                }
            }
        }

        return toResponse(jobRepository.save(job));
    }

    public void deleteJob(Long jobId, Long userId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getPostedByUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own jobs");
        }

        job.setDeletedAt(LocalDateTime.now());
        jobRepository.save(job);
    }

    public List<JobApplication> getApplications(Long jobId) {
        return jobApplicationRepository.findByJobId(jobId);
    }

    private JobResponse toResponse(Job job) {
        int appCount = jobApplicationRepository.findByJobId(job.getId()).size();

        String postedByName = "Unknown";
        String postedByPhone = null;

        if (job.getPostedByUser() != null) {
            postedByPhone = job.getPostedByUser().getPhone();
            postedByName = postedByPhone;

            var profile = profileRepository.findByUserId(job.getPostedByUser().getId());
            if (profile.isPresent() && profile.get().getDisplayName() != null
                    && !profile.get().getDisplayName().isEmpty()) {
                postedByName = profile.get().getDisplayName();
            }
        }

        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .category(job.getCategory())
                .pay(job.getPay())
                .location(job.getLocation())
                .status(job.getStatus())
                .postedBy(postedByName)
                .postedByPhone(postedByPhone)
                .postedById(job.getPostedByUser() != null ?
                        job.getPostedByUser().getId() : null)
                .barangay(job.getBarangay() != null ?
                        job.getBarangay().getName() : null)
                .city(job.getBarangay() != null ?
                        job.getBarangay().getCity() : null)
                .createdAt(job.getCreatedAt())
                .applicationCount(appCount)
                .dateNeeded(job.getDateNeeded())
                .build();
    }

    public List<ApplicationResponse> getJobApplications(Long jobId, Long userId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getPostedByUser().getId().equals(userId)) {
            throw new RuntimeException("You can only view applications for your own jobs");
        }

        return jobApplicationRepository.findByJobId(jobId)
                .stream()
                .map(app -> {
                    String applicantName = app.getUser().getPhone();
                    String applicantSkills = null;

                    var profile = profileRepository.findByUserId(app.getUser().getId());
                    if (profile.isPresent()) {
                        if (profile.get().getDisplayName() != null
                                && !profile.get().getDisplayName().isEmpty()) {
                            applicantName = profile.get().getDisplayName();
                        }
                        applicantSkills = profile.get().getSkillsSummary();
                    }

                    return ApplicationResponse.builder()
                            .id(app.getId())
                            .status(app.getStatus())
                            .appliedAt(app.getAppliedAt())
                            .job(toResponse(app.getJob()))
                            .applicantId(app.getUser().getId())
                            .applicantPhone(app.getUser().getPhone())
                            .applicantName(applicantName)
                            .applicantSkills(applicantSkills)
                            .build();
                })
                .collect(Collectors.toList());
    }

    public void updateApplicationStatus(Long applicationId, String status, Long userId) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        Job job = application.getJob();
        if (!job.getPostedByUser().getId().equals(userId)) {
            throw new RuntimeException("You can only update applications for your own jobs");
        }

        application.setStatus(status);
        jobApplicationRepository.save(application);

        if (status.equals("HIRED")) {
            job.setStatus("FILLED");
            jobRepository.save(job);
        }
    }

    public List<JobResponse> getMyPostedJobs(Long userId) {
        return jobRepository.findByPostedByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}