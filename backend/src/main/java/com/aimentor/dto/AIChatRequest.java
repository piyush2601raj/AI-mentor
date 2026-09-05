package com.aimentor.dto;

public class AIChatRequest {

    private Long studentId;
    private String message;

    public AIChatRequest() {
    }

    public AIChatRequest(Long studentId, String message) {
        this.studentId = studentId;
        this.message = message;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}