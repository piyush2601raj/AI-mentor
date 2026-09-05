package com.aimentor.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum CareerGoal {

    OTHER,
    DEVOPS_ENGINEER,
    SOFTWARE_DEVELOPER,
    DATA_SCIENTIST,
    AI_ML_ENGINEER,
    CYBERSECURITY,
    MOBILE_DEVELOPER,
    WEB_DEVELOPER,
    CLOUD_ENGINEER,
    DATA_ANALYST;

    @JsonCreator
    public static CareerGoal fromValue(String value) {

        if (value == null || value.trim().isEmpty()) {
            return OTHER;
        }

        String normalized = value
                .trim()
                .toUpperCase()
                .replace("-", "_")
                .replace(" ", "_");

        // Frontend / user-friendly values ko backend enum me map karo
        switch (normalized) {

            case "JAVA_FULL_STACK_DEVELOPER":
            case "JAVA_BACKEND_DEVELOPER":
            case "JAVA_DEVELOPER":
            case "FULL_STACK_DEVELOPER":
            case "SOFTWARE_DEVELOPER":
                return SOFTWARE_DEVELOPER;

            case "DEVOPS_ENGINEER":
            case "DEVOPS":
                return DEVOPS_ENGINEER;

            case "DATA_SCIENTIST":
            case "DATA_SCIENCE":
                return DATA_SCIENTIST;

            case "AI_ML_ENGINEER":
            case "AI_ENGINEER":
            case "MACHINE_LEARNING_ENGINEER":
            case "ARTIFICIAL_INTELLIGENCE":
                return AI_ML_ENGINEER;

            case "CYBERSECURITY":
            case "CYBER_SECURITY":
            case "CYBER_SECURITY_ENGINEER":
                return CYBERSECURITY;

            case "MOBILE_DEVELOPER":
            case "ANDROID_DEVELOPER":
                return MOBILE_DEVELOPER;

            case "WEB_DEVELOPER":
                return WEB_DEVELOPER;

            case "CLOUD_ENGINEER":
            case "CLOUD":
                return CLOUD_ENGINEER;

            case "DATA_ANALYST":
                return DATA_ANALYST;

            default:
                return OTHER;
        }
    }

    @JsonValue
    public String toValue() {
        return name();
    }
}