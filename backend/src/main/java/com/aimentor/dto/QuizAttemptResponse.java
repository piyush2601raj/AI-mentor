package com.aimentor.dto;

import com.aimentor.entity.QuizAttempt;

import java.time.LocalDateTime;

public class QuizAttemptResponse {

    private Long id;

    private Long quizId;

    private String quizTitle;

    private Long studentId;

    private Integer totalQuestions;

    private Integer correctAnswers;

    private Integer wrongAnswers;

    private Integer score;

    private Double percentage;

    private Boolean passed;

    private LocalDateTime attemptedAt;

    public QuizAttemptResponse() {
    }

    public QuizAttemptResponse(QuizAttempt attempt) {

        if (attempt == null) {
            return;
        }

        this.id = attempt.getId();

        // Quiz information
        if (attempt.getQuiz() != null) {
            this.quizId = attempt.getQuiz().getId();
            this.quizTitle = attempt.getQuiz().getTitle();
        }

        // Student information
        if (attempt.getStudent() != null) {
            this.studentId = attempt.getStudent().getId();
        }

        // Result information
        this.totalQuestions = attempt.getTotalQuestions();
        this.correctAnswers = attempt.getCorrectAnswers();
        this.wrongAnswers = attempt.getWrongAnswers();
        this.score = attempt.getScore();
        this.percentage = attempt.getPercentage();
        this.passed = attempt.getPassed();

        // Attempt time
        this.attemptedAt = attempt.getAttemptedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getQuizId() {
        return quizId;
    }

    public String getQuizTitle() {
        return quizTitle;
    }

    public Long getStudentId() {
        return studentId;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public Integer getCorrectAnswers() {
        return correctAnswers;
    }

    public Integer getWrongAnswers() {
        return wrongAnswers;
    }

    public Integer getScore() {
        return score;
    }

    public Double getPercentage() {
        return percentage;
    }

    public Boolean getPassed() {
        return passed;
    }

    public LocalDateTime getAttemptedAt() {
        return attemptedAt;
    }
}