package com.aimentor.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_chat_messages")
public class AIChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "student_id",
            nullable = false
    )
    private User student;

    @Column(
            name = "user_message",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String userMessage;

    @Column(
            name = "ai_response",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String aiResponse;

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    public AIChatMessage() {
    }

    public AIChatMessage(
            User student,
            String userMessage,
            String aiResponse) {

        this.student = student;
        this.userMessage = userMessage;
        this.aiResponse = aiResponse;
    }

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public String getUserMessage() {
        return userMessage;
    }

    public void setUserMessage(String userMessage) {
        this.userMessage = userMessage;
    }

    public String getAiResponse() {
        return aiResponse;
    }

    public void setAiResponse(String aiResponse) {
        this.aiResponse = aiResponse;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}