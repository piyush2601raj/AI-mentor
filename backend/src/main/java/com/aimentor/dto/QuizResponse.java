package com.aimentor.dto;

import com.aimentor.entity.Quiz;

public class QuizResponse {

    private Long id;
    private Long moduleId;
    private String moduleTitle;
    private String title;
    private String description;
    private Integer totalQuestions;

    public QuizResponse() {
    }

    public QuizResponse(Quiz quiz) {

        this.id = quiz.getId();

        if (quiz.getModule() != null) {
            this.moduleId = quiz.getModule().getId();
            this.moduleTitle = quiz.getModule().getTitle();
        }

        this.title = quiz.getTitle();
        this.description = quiz.getDescription();
        this.totalQuestions = quiz.getTotalQuestions();
    }

    public Long getId() {
        return id;
    }

    public Long getModuleId() {
        return moduleId;
    }

    public String getModuleTitle() {
        return moduleTitle;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }
}