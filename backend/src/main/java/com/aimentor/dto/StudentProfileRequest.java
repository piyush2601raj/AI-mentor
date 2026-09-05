package com.aimentor.dto;

import com.aimentor.entity.CareerGoal;

public class StudentProfileRequest {

    private CareerGoal careerGoal;

    private String experienceLevel;

    private Integer dailyStudyHours;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public StudentProfileRequest() {
    }


    // =====================================================
    // GETTERS
    // =====================================================

    public CareerGoal getCareerGoal() {
        return careerGoal;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public Integer getDailyStudyHours() {
        return dailyStudyHours;
    }


    // =====================================================
    // SETTERS
    // =====================================================

    public void setCareerGoal(CareerGoal careerGoal) {
        this.careerGoal = careerGoal;
    }

    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }

    public void setDailyStudyHours(Integer dailyStudyHours) {
        this.dailyStudyHours = dailyStudyHours;
    }
}