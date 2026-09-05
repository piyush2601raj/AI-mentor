package com.aimentor.dto;

public class LearningRoadmapResponse {

    private Long id;
    private Long studentId;
    private String studentName;

    private String title;
    private String description;
    private Integer durationWeeks;

    public LearningRoadmapResponse() {
    }

    public LearningRoadmapResponse(
            Long id,
            Long studentId,
            String studentName,
            String title,
            String description,
            Integer durationWeeks) {

        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.title = title;
        this.description = description;
        this.durationWeeks = durationWeeks;
    }

    public Long getId() {
        return id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Integer getDurationWeeks() {
        return durationWeeks;
    }
}