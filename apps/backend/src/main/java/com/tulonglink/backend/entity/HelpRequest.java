package com.tulonglink.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "help_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HelpRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String requestType;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(nullable = false)
    @Builder.Default
    private String privacyLevel = "PUBLIC";

    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING";

    @ManyToOne
    @JoinColumn(name = "assigned_org_id")
    private Organization assignedOrg;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}