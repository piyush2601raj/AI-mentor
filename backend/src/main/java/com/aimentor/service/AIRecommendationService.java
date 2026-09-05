package com.aimentor.service;

import com.aimentor.dto.AIRecommendationResponse;
import com.aimentor.dto.StudentDashboardResponse;
import tools.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class AIRecommendationService {

    private final StudentDashboardService dashboardService;
    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    public AIRecommendationService(
            StudentDashboardService dashboardService,
            ChatClient.Builder chatClientBuilder,
            ObjectMapper objectMapper) {

        this.dashboardService = dashboardService;
        this.chatClient = chatClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public AIRecommendationResponse generateRecommendation(
            Long studentId) {

        StudentDashboardResponse dashboard =
                dashboardService.getDashboard(studentId);

        String prompt = """
                You are an AI mentor for a personalized learning platform.

                Analyze the student's learning progress and provide
                practical and personalized guidance.

                Student:
                ID: %d
                Name: %s

                Learning Progress:
                Total Skills: %d
                Total Modules: %d
                Completed Modules: %d
                Roadmap Progress: %.2f%%

                Quiz Performance:
                Total Attempts: %d
                Passed Quizzes: %d
                Latest Score: %s
                Latest Percentage: %s
                Latest Quiz Passed: %s

                Provide:
                - a personalized recommendation
                - the most important focus area
                - one practical next action

                IMPORTANT:
                - Use the actual roadmap progress given above.
                - Do not invent module progress.
                - Make the recommendation consistent with the student's
                  actual progress.
                - Return ONLY valid JSON.
                - Do not use markdown.
                - Do not use ```json.
                - Do not add any explanation outside JSON.

                JSON format:
                {
                  "recommendation": "your recommendation",
                  "focusArea": "the most important focus area",
                  "nextAction": "one practical next action"
                }

                Keep the recommendation concise and practical.
                """.formatted(
                dashboard.getStudentId(),
                dashboard.getStudentName(),
                dashboard.getTotalSkills(),
                dashboard.getTotalModules(),
                dashboard.getCompletedModules(),
                dashboard.getRoadmapProgress(),
                dashboard.getTotalQuizAttempts(),
                dashboard.getPassedQuizzes(),
                String.valueOf(
                        dashboard.getLatestQuizScore()),
                String.valueOf(
                        dashboard.getLatestQuizPercentage()),
                String.valueOf(
                        dashboard.getLatestQuizPassed())
        );

        String aiResponse = chatClient
                .prompt()
                .user(prompt)
                .call()
                .content();

        try {

            String cleanedResponse = aiResponse
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();

            AIRecommendationResponse response =
                    objectMapper.readValue(
                            cleanedResponse,
                            AIRecommendationResponse.class
                    );

            /*
             * Student ID is NOT taken from AI response.
             * It is taken directly from the API request.
             */
            response.setStudentId(studentId);

            return response;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to parse AI recommendation. AI Response: "
                            + aiResponse,
                    e
            );
        }
    }
}