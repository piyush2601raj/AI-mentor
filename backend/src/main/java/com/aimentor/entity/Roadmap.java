package com.aimentor.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "roadmaps")
public class Roadmap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "student_id",
            nullable = false
    )
    @JsonIgnore
    private User student;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "duration_weeks", nullable = false)
    private Integer durationWeeks;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(
            mappedBy = "roadmap",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<RoadmapModule> modules = new ArrayList<>();


    // =====================================================
    // CONSTRUCTORS
    // =====================================================

    public Roadmap() {
    }

    public Roadmap(
            User student,
            String title,
            String description,
            Integer durationWeeks) {

        this.student = student;
        this.title = title;
        this.description = description;
        this.durationWeeks = durationWeeks;
    }


    // =====================================================
    // CREATE / UPDATE TIMESTAMP
    // =====================================================

    @PrePersist
    public void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;
    }

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

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Integer getDurationWeeks() {
        return durationWeeks;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public List<RoadmapModule> getModules() {
        return modules;
    }


    // =====================================================
    // SETTERS
    // =====================================================

    public void setStudent(User student) {
        this.student = student;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setDurationWeeks(Integer durationWeeks) {
        this.durationWeeks = durationWeeks;
    }

    public void setModules(List<RoadmapModule> modules) {
        this.modules = modules;
    }


    // =====================================================
    // MODULE MANAGEMENT
    // =====================================================

    public void addModule(RoadmapModule module) {

        modules.add(module);

        module.setRoadmap(this);
    }

    public void removeModule(RoadmapModule module) {

        modules.remove(module);

        module.setRoadmap(null);
    }
}