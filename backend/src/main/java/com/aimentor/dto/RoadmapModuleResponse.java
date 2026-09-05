package com.aimentor.dto;

import com.aimentor.entity.RoadmapModule;

public class RoadmapModuleResponse {

    private Long id;

    private Long roadmapId;

    private String title;

    private String description;

    private Integer weekNumber;

    private String status;

    // =====================================================
    // DEFAULT CONSTRUCTOR
    // =====================================================

    public RoadmapModuleResponse() {
    }

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public RoadmapModuleResponse(RoadmapModule module) {

        if (module == null) {
            return;
        }

        this.id = module.getId();

        if (module.getRoadmap() != null) {
            this.roadmapId = module.getRoadmap().getId();
        }

        this.title = module.getTitle();

        this.description = module.getDescription();

        this.weekNumber = module.getWeekNumber();

        if (module.getStatus() != null) {
            this.status = module.getStatus().name();
        } else {
            this.status = "NOT_STARTED";
        }
    }

    // =====================================================
    // GETTERS
    // =====================================================

    public Long getId() {
        return id;
    }

    public Long getRoadmapId() {
        return roadmapId;
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

    public String getStatus() {
        return status;
    }
}