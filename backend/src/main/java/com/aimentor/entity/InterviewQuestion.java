package com.aimentor.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "interview_questions")
public class InterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String careerGoal;

    /*
     * IMPORTANT:
     * This is the main skill used by Interview Prep.
     *
     * Examples:
     * Java
     * React
     * Spring Boot
     * Deep Learning
     * Python
     * SQL
     * Docker
     */
    @Column(length = 100)
    private String skill;

    /*
     * Topic inside the skill.
     *
     * Example:
     * Skill       = Java
     * Topic       = OOP
     *
     * Skill       = Deep Learning
     * Topic       = Neural Networks
     */
    @Column(nullable = false, length = 100)
    private String topic;

    @Column(nullable = false, length = 20)
    private String difficulty;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(length = 500)
    private String optionA;

    @Column(length = 500)
    private String optionB;

    @Column(length = 500)
    private String optionC;

    @Column(length = 500)
    private String optionD;

    @Column(length = 1)
    private String correctOption;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    public InterviewQuestion() {
    }

    /*
     * OLD CONSTRUCTOR
     * Keep this so existing code does not break.
     */
    public InterviewQuestion(
            String careerGoal,
            String topic,
            String difficulty,
            String question,
            String optionA,
            String optionB,
            String optionC,
            String optionD,
            String correctOption,
            String explanation
    ) {
        this.careerGoal = careerGoal;
        this.topic = topic;
        this.difficulty = difficulty;
        this.question = question;
        this.optionA = optionA;
        this.optionB = optionB;
        this.optionC = optionC;
        this.optionD = optionD;
        this.correctOption = correctOption;
        this.explanation = explanation;
    }

    /*
     * NEW CONSTRUCTOR
     */
    public InterviewQuestion(
            String careerGoal,
            String skill,
            String topic,
            String difficulty,
            String question,
            String optionA,
            String optionB,
            String optionC,
            String optionD,
            String correctOption,
            String explanation
    ) {
        this.careerGoal = careerGoal;
        this.skill = skill;
        this.topic = topic;
        this.difficulty = difficulty;
        this.question = question;
        this.optionA = optionA;
        this.optionB = optionB;
        this.optionC = optionC;
        this.optionD = optionD;
        this.correctOption = correctOption;
        this.explanation = explanation;
    }

    public Long getId() {
        return id;
    }

    public String getCareerGoal() {
        return careerGoal;
    }

    public String getSkill() {
        return skill;
    }

    public String getTopic() {
        return topic;
    }

    public String getDifficulty() {
        return difficulty;
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

    public String getCorrectOption() {
        return correctOption;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setCareerGoal(String v) {
        this.careerGoal = v;
    }

    public void setSkill(String v) {
        this.skill = v;
    }

    public void setTopic(String v) {
        this.topic = v;
    }

    public void setDifficulty(String v) {
        this.difficulty = v;
    }

    public void setQuestion(String v) {
        this.question = v;
    }

    public void setOptionA(String v) {
        this.optionA = v;
    }

    public void setOptionB(String v) {
        this.optionB = v;
    }

    public void setOptionC(String v) {
        this.optionC = v;
    }

    public void setOptionD(String v) {
        this.optionD = v;
    }

    public void setCorrectOption(String v) {
        this.correctOption = v;
    }

    public void setExplanation(String v) {
        this.explanation = v;
    }
}