package com.aimentor.dto;

public class AIChatResponse {

    private Long studentId;
    private String response;

    public AIChatResponse() {
    }

    public AIChatResponse(Long studentId, String response) {
        this.studentId = studentId;
        this.response = response;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }
}