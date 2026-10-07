package com.aimentor.dto;

import java.time.LocalDate;
import java.util.List;

public class RoadmapProgressResponse {

    private Long roadmapId;
    private Integer totalModules;
    private Integer completedModules;
    private Integer remainingModules;
    private Double progressPercentage;

    // =====================================================
    // STREAK DATA
    // =====================================================

    private Integer currentStreak;
    private Integer bestStreak;
    private List<LocalDate> activityDates;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public RoadmapProgressResponse(
            Long roadmapId,
            Integer totalModules,
            Integer completedModules,
            Integer remainingModules,
            Double progressPercentage,
            Integer currentStreak,
            Integer bestStreak,
            List<LocalDate> activityDates) {

        this.roadmapId = roadmapId;
        this.totalModules = totalModules;
        this.completedModules = completedModules;
        this.remainingModules = remainingModules;
        this.progressPercentage = progressPercentage;
        this.currentStreak = currentStreak;
        this.bestStreak = bestStreak;
        this.activityDates = activityDates;
    }

    // =====================================================
    // GETTERS
    // =====================================================

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

    public Integer getCurrentStreak() {
        return currentStreak;
    }

    public Integer getBestStreak() {
        return bestStreak;
    }

    public List<LocalDate> getActivityDates() {
        return activityDates;
    }
}