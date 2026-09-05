package com.aimentor.dto;

public class AIRecommendationResponse {

    private Long studentId;
    private String recommendation;
    private String focusArea;
    private String nextAction;

    public AIRecommendationResponse() {
    }

    public AIRecommendationResponse(
            Long studentId,
            String recommendation,
            String focusArea,
            String nextAction) {

        this.studentId = studentId;
        this.recommendation = recommendation;
        this.focusArea = focusArea;
        this.nextAction = nextAction;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }

    public String getFocusArea() {
        return focusArea;
    }

    public void setFocusArea(String focusArea) {
        this.focusArea = focusArea;
    }

    public String getNextAction() {
        return nextAction;
    }

    public void setNextAction(String nextAction) {
        this.nextAction = nextAction;
    }
}