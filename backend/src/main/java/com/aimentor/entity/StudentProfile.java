package com.aimentor.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "student_profiles",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "user_id")
    }
)
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "user_id",
        nullable = false,
        unique = true
    )
    private User student;

    @Enumerated(EnumType.STRING)
    @Column(
        name = "career_goal",
        nullable = false,
        length = 50
    )
    private CareerGoal careerGoal;

    @Column(
        name = "experience_level",
        nullable = false,
        length = 30
    )
    private String experienceLevel;

    @Column(
        name = "daily_study_hours",
        nullable = false
    )
    private Integer learningHoursPerDay;

    @Column(
        name = "created_at",
        nullable = false
    )
    private LocalDateTime createdAt;

    @Column(
        name = "updated_at",
        nullable = false
    )
    private LocalDateTime updatedAt;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public StudentProfile() {
    }


    // =====================================================
    // PRE PERSIST
    // =====================================================

    @PrePersist
    public void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }
    }


    // =====================================================
    // PRE UPDATE
    // =====================================================

    @PreUpdate
    public void onUpdate() {

        updatedAt = LocalDateTime.now();
    }


    // =====================================================
    // GETTERS
    // =====================================================

    public Long getId() {
        return id;
    }

    public User getStudent() {
        return student;
    }

    public CareerGoal getCareerGoal() {
        return careerGoal;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public Integer getLearningHoursPerDay() {
        return learningHoursPerDay;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }


    // =====================================================
    // SETTERS
    // =====================================================

    public void setStudent(User student) {
        this.student = student;
    }

    public void setCareerGoal(CareerGoal careerGoal) {
        this.careerGoal = careerGoal;
    }

    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }

    public void setLearningHoursPerDay(Integer learningHoursPerDay) {
        this.learningHoursPerDay = learningHoursPerDay;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}