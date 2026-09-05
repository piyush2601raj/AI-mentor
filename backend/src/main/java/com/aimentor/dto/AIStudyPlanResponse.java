package com.aimentor.dto;

import java.util.List;

public class AIStudyPlanResponse {

    private Long studentId;
    private String goal;
    private List<String> focusAreas;
    private List<String> weeklyPlan;
    private String recommendation;

    public AIStudyPlanResponse() {
    }

    public AIStudyPlanResponse(
            Long studentId,
            String goal,
            List<String> focusAreas,
            List<String> weeklyPlan,
            String recommendation) {

        this.studentId = studentId;
        this.goal = goal;
        this.focusAreas = focusAreas;
        this.weeklyPlan = weeklyPlan;
        this.recommendation = recommendation;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getGoal() {
        return goal;
    }

    public void setGoal(String goal) {
        this.goal = goal;
    }

    public List<String> getFocusAreas() {
        return focusAreas;
    }

    public void setFocusAreas(List<String> focusAreas) {
        this.focusAreas = focusAreas;
    }

    public List<String> getWeeklyPlan() {
        return weeklyPlan;
    }

    public void setWeeklyPlan(List<String> weeklyPlan) {
        this.weeklyPlan = weeklyPlan;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }
}