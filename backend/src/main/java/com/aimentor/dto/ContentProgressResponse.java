package com.aimentor.dto;

import com.aimentor.entity.ContentProgress;

import java.time.LocalDateTime;

public class ContentProgressResponse {

    private Long id;

    private Long studentId;

    private Long contentId;

    private String contentTitle;

    private Long moduleId;

    private String moduleTitle;

    private Boolean completed;

    private LocalDateTime completedAt;

    public ContentProgressResponse(ContentProgress progress) {

        this.id = progress.getId();

        this.studentId =
                progress.getStudent().getId();

        this.contentId =
                progress.getContent().getId();

        this.contentTitle =
                progress.getContent().getTitle();

        this.moduleId =
                progress.getContent()
                        .getModule()
                        .getId();

        this.moduleTitle =
                progress.getContent()
                        .getModule()
                        .getTitle();

        this.completed =
                progress.getCompleted();

        this.completedAt =
                progress.getCompletedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public Long getContentId() {
        return contentId;
    }

    public String getContentTitle() {
        return contentTitle;
    }

    public Long getModuleId() {
        return moduleId;
    }

    public String getModuleTitle() {
        return moduleTitle;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
}