package com.dance.library.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "share_link")
public class ShareLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "choreography_id", nullable = false)
    private Choreography choreography;

    @Column(name = "share_code", nullable = false, unique = true, length = 32)
    private String shareCode;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "expire_at")
    private LocalDateTime expireAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
    }
}
