package com.aimentor.dto;

public class DashboardResponse {

    private StudentInfo student;
    private Integer skillsCount;
    private RoadmapInfo roadmap;
    private NextModuleInfo nextModule;

    public DashboardResponse() {
    }

    public DashboardResponse(
            StudentInfo student,
            Integer skillsCount,
            RoadmapInfo roadmap,
            NextModuleInfo nextModule) {

        this.student = student;
        this.skillsCount = skillsCount;
        this.roadmap = roadmap;
        this.nextModule = nextModule;
    }

    public StudentInfo getStudent() {
        return student;
    }

    public void setStudent(StudentInfo student) {
        this.student = student;
    }

    public Integer getSkillsCount() {
        return skillsCount;
    }

    public void setSkillsCount(Integer skillsCount) {
        this.skillsCount = skillsCount;
    }

    public RoadmapInfo getRoadmap() {
        return roadmap;
    }

    public void setRoadmap(RoadmapInfo roadmap) {
        this.roadmap = roadmap;
    }

    public NextModuleInfo getNextModule() {
        return nextModule;
    }

    public void setNextModule(NextModuleInfo nextModule) {
        this.nextModule = nextModule;
    }

    // =========================
    // Student Info
    // =========================

    public static class StudentInfo {

        private Long id;
        private String name;
        private String email;

        public StudentInfo() {
        }

        public StudentInfo(
                Long id,
                String name,
                String email) {

            this.id = id;
            this.name = name;
            this.email = email;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    // =========================
    // Roadmap Info
    // =========================

    public static class RoadmapInfo {

        private Long roadmapId;
        private Integer totalModules;
        private Integer completedModules;
        private Integer remainingModules;
        private Double progressPercentage;

        public RoadmapInfo() {
        }

        public RoadmapInfo(
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

        public void setRoadmapId(Long roadmapId) {
            this.roadmapId = roadmapId;
        }

        public Integer getTotalModules() {
            return totalModules;
        }

        public void setTotalModules(Integer totalModules) {
            this.totalModules = totalModules;
        }

        public Integer getCompletedModules() {
            return completedModules;
        }

        public void setCompletedModules(Integer completedModules) {
            this.completedModules = completedModules;
        }

        public Integer getRemainingModules() {
            return remainingModules;
        }

        public void setRemainingModules(Integer remainingModules) {
            this.remainingModules = remainingModules;
        }

        public Double getProgressPercentage() {
            return progressPercentage;
        }

        public void setProgressPercentage(Double progressPercentage) {
            this.progressPercentage = progressPercentage;
        }
    }

    // =========================
    // Next Module Info
    // =========================

    public static class NextModuleInfo {

        private Long id;
        private String title;
        private String description;
        private Integer weekNumber;

        public NextModuleInfo() {
        }

        public NextModuleInfo(
                Long id,
                String title,
                String description,
                Integer weekNumber) {

            this.id = id;
            this.title = title;
            this.description = description;
            this.weekNumber = weekNumber;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
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