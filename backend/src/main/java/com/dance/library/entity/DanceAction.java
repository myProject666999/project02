package com.dance.library.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "dance_action")
public class DanceAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "video_path", nullable = false, length = 500)
    private String videoPath;

    @Column(name = "cover_path", length = 500)
    private String coverPath;

    @Column(nullable = false, length = 20)
    private String style;

    @Column(nullable = false)
    private Integer beat;

    @Column(nullable = false)
    private Integer difficulty;

    @Column(name = "body_part", nullable = false, length = 20)
    private String bodyPart;

    @Column(precision = 5, scale = 2)
    private BigDecimal duration;

    @Column(length = 500)
    private String description;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
