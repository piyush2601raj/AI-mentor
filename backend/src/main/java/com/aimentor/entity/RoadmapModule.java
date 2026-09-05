package com.aimentor.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "roadmap_modules")
public class RoadmapModule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "roadmap_id",
            nullable = false
    )
    @JsonIgnore
    private Roadmap roadmap;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "week_number", nullable = false)
    private Integer weekNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ModuleStatus status;

    // =====================================================
    // LEARNING CONTENT
    // =====================================================

    @OneToMany(
            mappedBy = "module",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @JsonIgnore
    private List<LearningContent> learningContent = new ArrayList<>();

    // =====================================================
    // DEFAULT CONSTRUCTOR
    // =====================================================

    public RoadmapModule() {
        this.status = ModuleStatus.NOT_STARTED;
    }

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public RoadmapModule(
            Roadmap roadmap,
            String title,
            String description,
            Integer weekNumber) {

        this.roadmap = roadmap;
        this.title = title;
        this.description = description;
        this.weekNumber = weekNumber;
        this.status = ModuleStatus.NOT_STARTED;
    }

    // =====================================================
    // CONSTRUCTOR WITH LEARNING CONTENT
    // =====================================================

    public RoadmapModule(
            Roadmap roadmap,
            String title,
            String description,
            List<LearningContent> learningContent,
            Integer weekNumber) {

        this.roadmap = roadmap;
        this.title = title;
        this.description = description;
        this.weekNumber = weekNumber;
        this.status = ModuleStatus.NOT_STARTED;

        if (learningContent != null) {
            this.learningContent = learningContent;

            for (LearningContent content : learningContent) {
                content.setModule(this);
            }
        }
    }

    // =====================================================
    // GETTERS
    // =====================================================

    public Long getId() {
        return id;
    }

    public Roadmap getRoadmap() {
        return roadmap;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Integer getWeekNumber() {
        return weekNumber;
    }

    public ModuleStatus getStatus() {
        return status;
    }

    // IMPORTANT:
    // Your handler is calling getLearningContent()
    public List<LearningContent> getLearningContent() {
        return learningContent;
    }

    // =====================================================
    // SETTERS
    // =====================================================

    public void setRoadmap(Roadmap roadmap) {
        this.roadmap = roadmap;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setWeekNumber(Integer weekNumber) {
        this.weekNumber = weekNumber;
    }

    public void setStatus(ModuleStatus status) {
        this.status = status;
    }

    public void setLearningContent(
            List<LearningContent> learningContent) {

        this.learningContent = learningContent;

        if (learningContent != null) {
            for (LearningContent content : learningContent) {
                content.setModule(this);
            }
        }
    }

    // =====================================================
    // ADD LEARNING CONTENT
    // =====================================================

    public void addLearningContent(
            LearningContent content) {

        if (content == null) {
            return;
        }

        this.learningContent.add(content);
        content.setModule(this);
    }

    // =====================================================
    // REMOVE LEARNING CONTENT
    // =====================================================

    public void removeLearningContent(
            LearningContent content) {

        if (content == null) {
            return;
        }

        this.learningContent.remove(content);
        content.setModule(null);
    }
}