package com.aimentor.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ProjectResponse {

    private Long id;

    private String title;
    private String description;
    private String category;

    private String status;
    private String priority;

    private Integer progress;

    private String githubUrl;
    private String liveUrl;

    private LocalDate startDate;
    private LocalDate deadline;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProjectResponse(
            Long id,
            String title,
            String description,
            String category,
            String status,
            String priority,
            Integer progress,
            String githubUrl,
            String liveUrl,
            LocalDate startDate,
            LocalDate deadline,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.status = status;
        this.priority = priority;
        this.progress = progress;
        this.githubUrl = githubUrl;
        this.liveUrl = liveUrl;
        this.startDate = startDate;
        this.deadline = deadline;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getCategory() {
        return category;
    }

    public String getStatus() {
        return status;
    }

    public String getPriority() {
        return priority;
    }

    public Integer getProgress() {
        return progress;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public String getLiveUrl() {
        return liveUrl;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}