package com.aimentor.dto;

import java.util.List;

public class AIRoadmapResponse {

    private String title;

    private String description;

    private Integer durationWeeks;

    private List<AIRoadmapModule> modules;

    public AIRoadmapResponse() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getDurationWeeks() {
        return durationWeeks;
    }

    public void setDurationWeeks(Integer durationWeeks) {
        this.durationWeeks = durationWeeks;
    }

    public List<AIRoadmapModule> getModules() {
        return modules;
    }

    public void setModules(List<AIRoadmapModule> modules) {
        this.modules = modules;
    }

    public static class AIRoadmapModule {

        private String title;

        private String description;

        private Integer weekNumber;

        public AIRoadmapModule() {
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Integer getWeekNumber() {
            return weekNumber;
        }

        public void setWeekNumber(Integer weekNumber) {
            this.weekNumber = weekNumber;
        }
    }
}