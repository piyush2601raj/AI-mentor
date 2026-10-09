package com.aimentor.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "flashcards",
    indexes = {
        @Index(name = "idx_flashcards_owner_topic", columnList = "owner_id, topic_name"),
        @Index(name = "idx_flashcards_owner_difficulty", columnList = "owner_id, difficulty")
    }
)
public class Flashcard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "topic_name", nullable = false, length = 150)
    private String topicName;

    @Column(nullable = false, length = 2000)
    private String question;

    @Column(nullable = false, length = 5000)
    private String answer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FlashcardDifficulty difficulty;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Flashcard() {}

    public Flashcard(User owner, String topicName, String question, String answer,
                     FlashcardDifficulty difficulty) {
        this.owner = owner;
        this.topicName = topicName;
        this.question = question;
        this.answer = answer;
        this.difficulty = difficulty;
    }

    public Long getId() { return id; }
    public User getOwner() { return owner; }
    public String getTopicName() { return topicName; }
    public String getQuestion() { return question; }
    public String getAnswer() { return answer; }
    public FlashcardDifficulty getDifficulty() { return difficulty; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setOwner(User owner) { this.owner = owner; }
    public void setTopicName(String topicName) { this.topicName = topicName; }
    public void setQuestion(String question) { this.question = question; }
    public void setAnswer(String answer) { this.answer = answer; }
    public void setDifficulty(FlashcardDifficulty difficulty) { this.difficulty = difficulty; }
}
