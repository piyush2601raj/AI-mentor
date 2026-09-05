package com.aimentor.dto;

public record InterviewSummaryResponse(int totalQuestions, int attempted, int mastered,
                                       int accuracy, int masteryPercent) {}
