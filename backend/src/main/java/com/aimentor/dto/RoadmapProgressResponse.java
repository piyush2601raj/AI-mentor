package com.aimentor.dto;

public class RoadmapProgressResponse {

    private Long roadmapId;
    private Integer totalModules;
    private Integer completedModules;
    private Integer remainingModules;
    private Double progressPercentage;

    public RoadmapProgressResponse(
            Long roadmapId,
            Integer totalModules,
            Integer completedModules,
            Integer remainingModules,
            Double progressPercentage) {

        this.roadmapId = roadmapId;
        this.totalModules = totalModules;
        this.completedModules = completedModules;
        this.remainingModules = remainingModules;
        this.progressPercentage = progressPercentage;
    }

    public Long getRoadmapId() {
        return roadmapId;
    }

    public Integer getTotalModules() {
        return totalModules;
    }

    public Integer getCompletedModules() {
        return completedModules;
    }

    public Integer getRemainingModules() {
        return remainingModules;
    }

    public Double getProgressPercentage() {
        return progressPercentage;
    }
}