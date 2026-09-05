package com.aimentor.service;

import com.aimentor.dto.AIAnalysisResponse;
import com.aimentor.entity.StudentSkill;
import com.aimentor.entity.User;
import com.aimentor.repository.StudentSkillRepository;
import com.aimentor.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AIAnalysisService {

    private final StudentSkillRepository studentSkillRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final ChatClient chatClient;

    public AIAnalysisService(
            StudentSkillRepository studentSkillRepository,
            UserRepository userRepository,
            ObjectMapper objectMapper,
            ChatClient.Builder chatClientBuilder) {

        this.studentSkillRepository = studentSkillRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.chatClient = chatClientBuilder.build();
    }

    // =====================================================
    // GENERATE PERSONALIZED AI ANALYSIS
    // =====================================================

    public AIAnalysisResponse generateAnalysis(Long studentId) {

        if (studentId == null) {
            throw new IllegalArgumentException(
                    "Student ID is required."
            );
        }

        System.out.println("====================================");
        System.out.println("GROQ AI ANALYSIS GENERATION");
        System.out.println("Student ID: " + studentId);
        System.out.println("====================================");

        // =================================================
        // GET STUDENT
        // =================================================

        User student = userRepository.findById(studentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Student not found with ID: "
                                        + studentId
                        )
                );

        // =================================================
        // GET SELECTED SKILLS
        // =================================================

        List<StudentSkill> studentSkills =
                studentSkillRepository.findByStudentId(studentId);

        if (studentSkills == null ||
                studentSkills.isEmpty()) {

            throw new RuntimeException(
                    "Please select at least one skill before generating AI analysis."
            );
        }

        // =================================================
        // CONVERT SKILLS INTO AI INPUT
        // =================================================

        String skills = studentSkills.stream()
                .map(skill -> {

                    String skillName =
                            skill.getSkill() != null
                                    ? skill.getSkill().getName()
                                    : "Unknown Skill";

                    String level =
                            skill.getSkillLevel() != null
                                    ? skill.getSkillLevel().name()
                                    : "BEGINNER";

                    return skillName + " (" + level + ")";

                })
                .collect(Collectors.joining(", "));

        System.out.println("====================================");
        System.out.println("STUDENT");
        System.out.println("Name   : " + student.getName());
        System.out.println("Skills : " + skills);
        System.out.println("====================================");

        // =================================================
        // BUILD GROQ PROMPT
        // =================================================

        String prompt = buildPrompt(
                student.getName(),
                skills
        );

        String aiResponse;

        // =================================================
        // CALL GROQ
        // =================================================

        try {

            System.out.println("====================================");
            System.out.println("SENDING REQUEST TO GROQ");
            System.out.println("====================================");

            long startTime = System.currentTimeMillis();

            aiResponse = chatClient
                    .prompt()
                    .user(prompt)
                    .call()
                    .content();

            long endTime = System.currentTimeMillis();

            System.out.println(
                    "Groq response received in "
                            + (endTime - startTime)
                            + " ms"
            );

        } catch (Exception e) {

            e.printStackTrace();

            String rootMessage =
                    getRootMessage(e);

            String errorText =
                    buildExceptionText(
                            e,
                            rootMessage
                    );

            if (isQuotaError(errorText)) {

                throw new RuntimeException(
                        "Groq API rate limit exceeded. "
                                + "Please try again later.",
                        e
                );
            }

            if (isAuthenticationError(errorText)) {

                throw new RuntimeException(
                        "Groq API authentication failed. "
                                + "Please check GROQ_API_KEY.",
                        e
                );
            }

            if (isModelError(errorText)) {

                throw new RuntimeException(
                        "Groq model configuration failed. "
                                + "Please check the Groq model name.",
                        e
                );
            }

            throw new RuntimeException(
                    "Groq AI generation failed: "
                            + rootMessage,
                    e
            );
        }

        // =================================================
        // EMPTY RESPONSE
        // =================================================

        if (aiResponse == null ||
                aiResponse.trim().isEmpty()) {

            throw new RuntimeException(
                    "Groq returned an empty response."
            );
        }

        System.out.println("====================================");
        System.out.println("GROQ RESPONSE RECEIVED");
        System.out.println("====================================");

        System.out.println(aiResponse);

        // =================================================
        // CLEAN JSON
        // =================================================

        String cleanedResponse;

        try {

            cleanedResponse =
                    cleanJson(aiResponse);

        } catch (Exception e) {

            throw new RuntimeException(
                    "Unable to clean Groq response: "
                            + getRootMessage(e),
                    e
            );
        }

        // =================================================
        // PARSE JSON
        // =================================================

        try {

            AIAnalysisResponse response =
                    objectMapper.readValue(
                            cleanedResponse,
                            AIAnalysisResponse.class
                    );

            System.out.println(
                    "GROQ JSON PARSED SUCCESSFULLY"
            );

            return response;

        } catch (Exception e) {

            System.err.println(
                    "GROQ JSON PARSING ERROR"
            );

            System.err.println(
                    "Cleaned response:"
            );

            System.err.println(
                    cleanedResponse
            );

            throw new RuntimeException(
                    "Unable to parse Groq response: "
                            + getRootMessage(e),
                    e
            );
        }
    }

    // =====================================================
    // BUILD PERSONALIZED GROQ PROMPT
    // =====================================================

    private String buildPrompt(
            String studentName,
            String skills) {

        return """
                You are an AI career mentor for a college student.

                STUDENT NAME:
                %s

                SELECTED SKILLS:
                %s

                =================================================
                VERY IMPORTANT RULE:
                =================================================

                The selected skills above are the ONLY basis
                for the career recommendation.

                DO NOT generate a generic Software Engineer
                career recommendation.

                The career goal MUST directly match the
                selected skills.

                Examples:

                Python -> Python Developer

                Java -> Java Developer

                React -> React Developer

                Java + React -> Java Full Stack Developer

                AWS -> Cloud Engineer

                Machine Learning -> Machine Learning Engineer

                Artificial Intelligence -> AI Engineer

                Cyber Security -> Cyber Security Analyst

                SQL -> Database Developer

                Data Analytics -> Data Analyst

                If multiple skills are selected, combine
                them logically.

                NEVER replace the selected skill with
                Software Engineering unless Software
                Engineering itself is selected.

                =================================================
                SKILL LEVEL RULES:
                =================================================

                BEGINNER:
                Start with fundamentals.

                INTERMEDIATE:
                Focus on intermediate concepts and practical
                implementation.

                ADVANCED:
                Focus on advanced concepts, real-world
                implementation and interview preparation.

                =================================================
                GENERATE EXACTLY:
                =================================================

                1. careerGoal
                2. summary
                3. exactly 3 strengths
                4. exactly 3 skillGaps
                5. exactly 4 roadmap phases
                6. exactly 3 recommendations

                =================================================
                ROADMAP RULE:
                =================================================

                Every phase MUST be related to the selected
                skills.

                Every topic MUST be related to the selected
                skills.

                Every project MUST be related to the selected
                skills.

                Recommendations MUST also be related to the
                selected skills.

                Do NOT introduce unrelated technologies.

                =================================================
                RETURN ONLY VALID JSON
                =================================================

                Do NOT use markdown.

                Do NOT use ```json.

                Do NOT add any explanation before or after JSON.

                Use exactly this structure:

                {
                  "careerGoal": "career directly related to selected skills",

                  "summary": "personalized summary",

                  "strengths": [
                    "strength 1",
                    "strength 2",
                    "strength 3"
                  ],

                  "skillGaps": [
                    "skill gap 1",
                    "skill gap 2",
                    "skill gap 3"
                  ],

                  "roadmap": [
                    {
                      "phase": 1,
                      "title": "Foundation",
                      "description": "foundation concepts related to selected skills",
                      "topics": [
                        "topic 1",
                        "topic 2",
                        "topic 3"
                      ]
                    },
                    {
                      "phase": 2,
                      "title": "Core Concepts",
                      "description": "core concepts related to selected skills",
                      "topics": [
                        "topic 1",
                        "topic 2",
                        "topic 3"
                      ]
                    },
                    {
                      "phase": 3,
                      "title": "Advanced / Real World",
                      "description": "advanced practical concepts related to selected skills",
                      "topics": [
                        "topic 1",
                        "topic 2",
                        "topic 3"
                      ]
                    },
                    {
                      "phase": 4,
                      "title": "Projects & Placement",
                      "description": "projects and interview preparation related to selected skills",
                      "topics": [
                        "project 1",
                        "project 2",
                        "interview preparation"
                      ]
                    }
                  ],

                  "recommendations": [
                    "recommendation 1",
                    "recommendation 2",
                    "recommendation 3"
                  ]
                }

                =================================================
                FINAL VALIDATION:
                =================================================

                careerGoal MUST match selected skills.

                summary MUST match selected skills.

                strengths MUST match selected skills.

                skillGaps MUST match selected skills.

                ALL roadmap phases MUST match selected skills.

                ALL topics MUST match selected skills.

                ALL projects MUST match selected skills.

                recommendations MUST match selected skills.

                DO NOT introduce unrelated careers.

                DO NOT generate a generic Software Engineer
                roadmap.

                Student:
                %s

                """.formatted(
                studentName,
                skills,
                studentName
        );
    }

    // =====================================================
    // CLEAN JSON RESPONSE
    // =====================================================

    private String cleanJson(String response) {

        if (response == null) {

            throw new IllegalArgumentException(
                    "Groq response is null."
            );
        }

        String result =
                response.trim();

        if (result.startsWith("```json")) {

            result =
                    result.substring(7);

        } else if (result.startsWith("```")) {

            result =
                    result.substring(3);
        }

        if (result.endsWith("```")) {

            result =
                    result.substring(
                            0,
                            result.length() - 3
                    );
        }

        result = result.trim();

        int start =
                result.indexOf("{");

        int end =
                result.lastIndexOf("}");

        if (start >= 0 && end > start) {

            result =
                    result.substring(
                            start,
                            end + 1
                    );
        }

        return result.trim();
    }

    // =====================================================
    // RATE LIMIT ERROR
    // =====================================================

    private boolean isQuotaError(
            String text) {

        if (text == null) {
            return false;
        }

        return text.contains("429")
                || text.contains("rate limit")
                || text.contains("rate_limit")
                || text.contains("too many requests")
                || text.contains("quota")
                || text.contains("resource exhausted");
    }

    // =====================================================
    // AUTH ERROR
    // =====================================================

    private boolean isAuthenticationError(
            String text) {

        if (text == null) {
            return false;
        }

        return text.contains("401")
                || text.contains("403")
                || text.contains("unauthorized")
                || text.contains("authentication")
                || text.contains("invalid api key")
                || text.contains("api key");
    }

    // =====================================================
    // MODEL ERROR
    // =====================================================

    private boolean isModelError(
            String text) {

        if (text == null) {
            return false;
        }

        return text.contains("404")
                || text.contains("model not found")
                || text.contains("unknown model")
                || text.contains("invalid model");
    }

    // =====================================================
    // BUILD EXCEPTION TEXT
    // =====================================================

    private String buildExceptionText(
            Throwable throwable,
            String rootMessage) {

        StringBuilder text =
                new StringBuilder();

        if (rootMessage != null) {

            text.append(
                    rootMessage.toLowerCase()
            );
        }

        Throwable current =
                throwable;

        while (current != null) {

            if (current.getMessage() != null) {

                text.append(" ")
                        .append(
                                current.getMessage()
                                        .toLowerCase()
                        );
            }

            text.append(" ")
                    .append(
                            current.getClass()
                                    .getName()
                                    .toLowerCase()
                    );

            current =
                    current.getCause();
        }

        return text.toString();
    }

    // =====================================================
    // ROOT ERROR MESSAGE
    // =====================================================

    private String getRootMessage(
            Throwable throwable) {

        if (throwable == null) {

            return "Unknown Groq error";
        }

        Throwable current =
                throwable;

        String lastUsefulMessage =
                null;

        while (current != null) {

            String message =
                    current.getMessage();

            if (message != null &&
                    !message.isBlank()) {

                lastUsefulMessage =
                        message;
            }

            current =
                    current.getCause();
        }

        if (lastUsefulMessage == null ||
                lastUsefulMessage.isBlank()) {

            return "Unknown Groq error";
        }

        return lastUsefulMessage;
    }
}