package com.aimentor.dto;

public class GenerateFlashcardsRequest {
    private String topic;
    private String difficulty = "MEDIUM";
    private Integer count = 10;

    public String getTopic() { return topic; }
    public String getDifficulty() { return difficulty; }
    public Integer getCount() { return count; }

    public void setTopic(String topic) { this.topic = topic; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public void setCount(Integer count) { this.count = count; }
}
