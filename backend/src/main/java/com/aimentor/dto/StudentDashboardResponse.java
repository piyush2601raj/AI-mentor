package com.aimentor.dto;

public class StudentDashboardResponse {

    private Long studentId;
    private String studentName;
    private String email;

    private int totalSkills;

    private int totalModules;
    private int completedModules;
    private double roadmapProgress;

    private int totalQuizAttempts;
    private int passedQuizzes;

    private Integer latestQuizScore;
    private Double latestQuizPercentage;
    private Boolean latestQuizPassed;

    public StudentDashboardResponse() {
    }

    public StudentDashboardResponse(
            Long studentId,
            String studentName,
            String email,
            int totalSkills,
            int totalModules,
            int completedModules,
            double roadmapProgress,
            int totalQuizAttempts,
            int passedQuizzes,
            Integer latestQuizScore,
            Double latestQuizPercentage,
            Boolean latestQuizPassed) {

        this.studentId = studentId;
        this.studentName = studentName;
        this.email = email;
        this.totalSkills = totalSkills;
        this.totalModules = totalModules;
        this.completedModules = completedModules;
        this.roadmapProgress = roadmapProgress;
        this.totalQuizAttempts = totalQuizAttempts;
        this.passedQuizzes = passedQuizzes;
        this.latestQuizScore = latestQuizScore;
        this.latestQuizPercentage = latestQuizPercentage;
        this.latestQuizPassed = latestQuizPassed;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public String getEmail() {
        return email;
    }

    public int getTotalSkills() {
        return totalSkills;
    }

    public int getTotalModules() {
        return totalModules;
    }

    public int getCompletedModules() {
        return completedModules;
    }

    public double getRoadmapProgress() {
        return roadmapProgress;
    }

    public int getTotalQuizAttempts() {
        return totalQuizAttempts;
    }

    public int getPassedQuizzes() {
        return passedQuizzes;
    }

    public Integer getLatestQuizScore() {
        return latestQuizScore;
    }

    public Double getLatestQuizPercentage() {
        return latestQuizPercentage;
    }

    public Boolean getLatestQuizPassed() {
        return latestQuizPassed;
    }
}