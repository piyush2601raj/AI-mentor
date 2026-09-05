package com.aimentor.dto;

public class InterviewAttemptResponse {

    private boolean correct;
    private boolean mastered;
    private int attempts;
    private int correctAttempts;
    private int mastery;
    private String explanation;
    private String correctOption;

    public InterviewAttemptResponse(
            boolean correct,
            boolean mastered,
            int attempts,
            int correctAttempts,
            int mastery,
            String explanation,
            String correctOption) {

        this.correct = correct;
        this.mastered = mastered;
        this.attempts = attempts;
        this.correctAttempts = correctAttempts;
        this.mastery = mastery;
        this.explanation = explanation;
        this.correctOption = correctOption;
    }

    public boolean isCorrect() {
        return correct;
    }

    public boolean isMastered() {
        return mastered;
    }

    public int getAttempts() {
        return attempts;
    }

    public int getCorrectAttempts() {
        return correctAttempts;
    }

    public int getMastery() {
        return mastery;
    }

    public String getExplanation() {
        return explanation;
    }

    public String getCorrectOption() {
        return correctOption;
    }
}