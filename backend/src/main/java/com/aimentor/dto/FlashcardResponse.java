package com.aimentor.dto;

import com.aimentor.entity.Flashcard;

public class FlashcardResponse {
    private Long id;
    private String topicName;
    private String question;
    private String answer;
    private String difficulty;

    public FlashcardResponse() {}

    public FlashcardResponse(Long id, String topicName, String question, String answer, String difficulty) {
        this.id = id;
        this.topicName = topicName;
        this.question = question;
        this.answer = answer;
        this.difficulty = difficulty;
    }

    public static FlashcardResponse from(Flashcard card) {
        return new FlashcardResponse(
            card.getId(), card.getTopicName(), card.getQuestion(),
            card.getAnswer(), card.getDifficulty().name()
        );
    }

    public Long getId() { return id; }
    public String getTopicName() { return topicName; }
    public String getQuestion() { return question; }
    public String getAnswer() { return answer; }
    public String getDifficulty() { return difficulty; }

    public void setId(Long id) { this.id = id; }
    public void setTopicName(String topicName) { this.topicName = topicName; }
    public void setQuestion(String question) { this.question = question; }
    public void setAnswer(String answer) { this.answer = answer; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
}
