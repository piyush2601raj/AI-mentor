package com.aimentor.dto;

public class RoadmapModuleProgressResponse {

    private Long moduleId;
    private String moduleTitle;
    private String status;

    public RoadmapModuleProgressResponse(
            Long moduleId,
            String moduleTitle,
            String status) {

        this.moduleId = moduleId;
        this.moduleTitle = moduleTitle;
        this.status = status;
    }

    public Long getModuleId() {
        return moduleId;
    }

    public String getModuleTitle() {
        return moduleTitle;
    }

    public String getStatus() {
        return status;
    }
}