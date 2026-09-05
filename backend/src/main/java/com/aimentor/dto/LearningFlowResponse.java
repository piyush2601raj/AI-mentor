package com.aimentor.dto;

public class LearningFlowResponse {

    private ModuleResponse currentModule;
    private ModuleResponse nextModule;

    public LearningFlowResponse(
            ModuleResponse currentModule,
            ModuleResponse nextModule) {

        this.currentModule = currentModule;
        this.nextModule = nextModule;
    }

    public ModuleResponse getCurrentModule() {
        return currentModule;
    }

    public ModuleResponse getNextModule() {
        return nextModule;
    }

    public static class ModuleResponse {

        private Long id;
        private String title;
        private String description;
        private Integer weekNumber;
        private String status;

        public ModuleResponse(
                Long id,
                String title,
                String description,
                Integer weekNumber,
                String status) {

            this.id = id;
            this.title = title;
            this.description = description;
            this.weekNumber = weekNumber;
            this.status = status;
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

        public Integer getWeekNumber() {
            return weekNumber;
        }

        public String getStatus() {
            return status;
        }
    }
}