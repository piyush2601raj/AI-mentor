package com.aimentor.dto;

import java.time.LocalDateTime;

public class AIChatHistoryResponse {

    private Long id;
    private Long studentId;
    private String userMessage;
    private String aiResponse;
    private LocalDateTime createdAt;

    public AIChatHistoryResponse() {
    }

    public AIChatHistoryResponse(
            Long id,
            Long studentId,
            String userMessage,
            String aiResponse,
            LocalDateTime createdAt) {

        this.id = id;
        this.studentId = studentId;
        this.userMessage = userMessage;
        this.aiResponse = aiResponse;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getUserMessage() {
        return userMessage;
    }

    public String getAiResponse() {
        return aiResponse;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}