package com.aimentor.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "flashcard_progress",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_flashcard_progress_user_card",
        columnNames = {"student_id", "flashcard_id"}
    ),
    indexes = @Index(name = "idx_flashcard_progress_student", columnList = "student_id")
)
public class FlashcardProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "flashcard_id", nullable = false)
    private Flashcard flashcard;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private FlashcardProgressStatus status;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        updatedAt = LocalDateTime.now();
    }

    public FlashcardProgress() {}

    public FlashcardProgress(User student, Flashcard flashcard, FlashcardProgressStatus status) {
        this.student = student;
        this.flashcard = flashcard;
        this.status = status;
    }

    public Long getId() { return id; }
    public User getStudent() { return student; }
    public Flashcard getFlashcard() { return flashcard; }
    public FlashcardProgressStatus getStatus() { return status; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setStudent(User student) { this.student = student; }
    public void setFlashcard(Flashcard flashcard) { this.flashcard = flashcard; }
    public void setStatus(FlashcardProgressStatus status) { this.status = status; }
}
