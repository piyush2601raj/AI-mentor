package com.aimentor.dto;

import java.util.List;

public class AIAnalysisResponse {

    private String careerGoal;
    private String summary;

    private List<String> strengths;
    private List<String> skillGaps;
    private List<RoadmapItem> roadmap;
    private List<String> recommendations;

    public AIAnalysisResponse() {
    }

    public AIAnalysisResponse(
            String careerGoal,
            String summary,
            List<String> strengths,
            List<String> skillGaps,
            List<RoadmapItem> roadmap,
            List<String> recommendations) {

        this.careerGoal = careerGoal;
        this.summary = summary;
        this.strengths = strengths;
        this.skillGaps = skillGaps;
        this.roadmap = roadmap;
        this.recommendations = recommendations;
    }

    public String getCareerGoal() {
        return careerGoal;
    }

    public void setCareerGoal(String careerGoal) {
        this.careerGoal = careerGoal;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<String> getStrengths() {
        return strengths;
    }

    public void setStrengths(List<String> strengths) {
        this.strengths = strengths;
    }

    public List<String> getSkillGaps() {
        return skillGaps;
    }

    public void setSkillGaps(List<String> skillGaps) {
        this.skillGaps = skillGaps;
    }

    public List<RoadmapItem> getRoadmap() {
        return roadmap;
    }

    public void setRoadmap(List<RoadmapItem> roadmap) {
        this.roadmap = roadmap;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }

    public static class RoadmapItem {

        private int phase;
        private String title;
        private String description;
        private List<String> topics;

        public RoadmapItem() {
        }

        public RoadmapItem(
                int phase,
                String title,
                String description,
                List<String> topics) {

            this.phase = phase;
            this.title = title;
            this.description = description;
            this.topics = topics;
        }

        public int getPhase() {
            return phase;
        }

        public void setPhase(int phase) {
            this.phase = phase;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public List<String> getTopics() {
            return topics;
        }

        public void setTopics(List<String> topics) {
            this.topics = topics;
        }
    }
}