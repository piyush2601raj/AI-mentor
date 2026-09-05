package com.aimentor.dto;

public record InterviewQuestionResponse(
        Long id,
        String skill,
        String topic,
        String difficulty,
        String question,
        String optionA,
        String optionB,
        String optionC,
        String optionD,
        String explanation,
        boolean attempted,
        boolean mastered,
        int attempts,
        int correctAttempts
) {}