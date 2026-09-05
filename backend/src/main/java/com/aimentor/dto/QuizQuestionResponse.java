package com.aimentor.dto;

import com.aimentor.entity.QuizQuestion;

public class QuizQuestionResponse {

    private Long id;

    private Long quizId;

    private String quizTitle;

    private String question;

    private String optionA;

    private String optionB;

    private String optionC;

    private String optionD;

    public QuizQuestionResponse() {
    }

    public QuizQuestionResponse(QuizQuestion quizQuestion) {

        this.id = quizQuestion.getId();

        if (quizQuestion.getQuiz() != null) {
            this.quizId = quizQuestion.getQuiz().getId();
            this.quizTitle = quizQuestion.getQuiz().getTitle();
        }

        this.question = quizQuestion.getQuestion();
        this.optionA = quizQuestion.getOptionA();
        this.optionB = quizQuestion.getOptionB();
        this.optionC = quizQuestion.getOptionC();
        this.optionD = quizQuestion.getOptionD();
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

    public String getQuestion() {
        return question;
    }

    public String getOptionA() {
        return optionA;
    }

    public String getOptionB() {
        return optionB;
    }

    public String getOptionC() {
        return optionC;
    }

    public String getOptionD() {
        return optionD;
    }
}