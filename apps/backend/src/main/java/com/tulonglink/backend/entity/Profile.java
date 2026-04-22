package com.tulonglink.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "barangay_id")
    private Barangay barangay;

    @Column
    private String displayName;

    @Column
    private String language;

    @Column
    private String skillsSummary;

    @Column
    @Builder.Default
    private Boolean largeTextEnabled = false;
}