package com.tulonglink.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column
    private String category;

    @Column
    private String pay;

    @Column
    private LocalDateTime dateNeeded;

    @Column
    private String location;

    @Column(nullable = false)
    @Builder.Default
    private String status = "OPEN";

    @ManyToOne
    @JoinColumn(name = "posted_by_user_id")
    private User postedByUser;

    @ManyToOne
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @ManyToOne
    @JoinColumn(name = "barangay_id")
    private Barangay barangay;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}