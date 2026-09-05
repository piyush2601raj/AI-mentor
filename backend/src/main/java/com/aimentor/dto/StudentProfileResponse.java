package com.aimentor.dto;

public class StudentProfileResponse {

    private Long id;

    private Long studentId;

    private String studentName;

    private String careerGoal;

    private String experienceLevel;

    private Integer learningHoursPerDay;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public StudentProfileResponse() {
    }


    public StudentProfileResponse(
            Long id,
            Long studentId,
            String studentName,
            String careerGoal,
            String experienceLevel,
            Integer learningHoursPerDay) {

        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.careerGoal = careerGoal;
        this.experienceLevel = experienceLevel;
        this.learningHoursPerDay = learningHoursPerDay;
    }


    // =====================================================
    // GETTERS
    // =====================================================

    public Long getId() {
        return id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public String getCareerGoal() {
        return careerGoal;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public Integer getLearningHoursPerDay() {
        return learningHoursPerDay;
    }


    // =====================================================
    // SETTERS
    // =====================================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public void setCareerGoal(String careerGoal) {
        this.careerGoal = careerGoal;
    }

    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }

    public void setLearningHoursPerDay(Integer learningHoursPerDay) {
        this.learningHoursPerDay = learningHoursPerDay;
    }
}