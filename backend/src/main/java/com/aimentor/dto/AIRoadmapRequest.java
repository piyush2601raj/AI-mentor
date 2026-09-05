package com.aimentor.dto;

public class AIRoadmapRequest {

    private Long studentId;

    public AIRoadmapRequest() {
    }

    public AIRoadmapRequest(Long studentId) {
        this.studentId = studentId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }
}