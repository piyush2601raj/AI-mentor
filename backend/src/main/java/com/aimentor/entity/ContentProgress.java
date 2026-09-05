package com.aimentor.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "content_progress",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"student_id", "content_id"}
                )
        }
)
public class ContentProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "student_id",
            nullable = false
    )
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "content_id",
            nullable = false
    )
    private LearningContent content;

    @Column(nullable = false)
    private Boolean completed = false;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public ContentProgress() {
    }

    public ContentProgress(
            User student,
            LearningContent content) {

        this.student = student;
        this.content = content;
        this.completed = false;
    }

    @PreUpdate
    public void updateCompletedAt() {

        if (Boolean.TRUE.equals(completed)
                && completedAt == null) {

            completedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public LearningContent getContent() {
        return content;
    }

    public void setContent(LearningContent content) {
        this.content = content;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {

        this.completed = completed;

        if (Boolean.TRUE.equals(completed)
                && completedAt == null) {

            completedAt = LocalDateTime.now();
        }

        if (Boolean.FALSE.equals(completed)) {
            completedAt = null;
        }
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
}