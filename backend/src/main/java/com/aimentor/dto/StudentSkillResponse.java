package com.aimentor.dto;

public class StudentSkillResponse {

    private Long id;
    private Long studentId;
    private String studentName;

    private Long skillId;
    private String skillName;
    private String category;

    private String skillLevel;

    public StudentSkillResponse() {
    }

    public StudentSkillResponse(
            Long id,
            Long studentId,
            String studentName,
            Long skillId,
            String skillName,
            String category,
            String skillLevel) {

        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.skillId = skillId;
        this.skillName = skillName;
        this.category = category;
        this.skillLevel = skillLevel;
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

    public Long getSkillId() {
        return skillId;
    }

    public String getSkillName() {
        return skillName;
    }

    public String getCategory() {
        return category;
    }

    public String getSkillLevel() {
        return skillLevel;
    }
}