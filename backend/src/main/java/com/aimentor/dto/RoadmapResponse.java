package com.aimentor.dto;

import com.aimentor.entity.Roadmap;

import java.time.LocalDateTime;

public class RoadmapResponse {

    private Long id;
    private Long studentId;
    private String title;
    private String description;
    private Integer durationWeeks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RoadmapResponse(Roadmap roadmap) {

        this.id = roadmap.getId();

        if (roadmap.getStudent() != null) {
            this.studentId = roadmap.getStudent().getId();
        }

        this.title = roadmap.getTitle();
        this.description = roadmap.getDescription();
        this.durationWeeks = roadmap.getDurationWeeks();
        this.createdAt = roadmap.getCreatedAt();
        this.updatedAt = roadmap.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getStudentId() {
        return studentId;
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
}