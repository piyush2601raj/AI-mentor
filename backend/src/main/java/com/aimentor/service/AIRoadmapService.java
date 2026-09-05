package com.aimentor.service;

import com.aimentor.entity.LearningContent;
import com.aimentor.entity.LearningContentType;
import com.aimentor.entity.Roadmap;
import com.aimentor.entity.RoadmapModule;
import com.aimentor.entity.StudentProfile;
import com.aimentor.repository.LearningContentRepository;
import com.aimentor.repository.RoadmapModuleRepository;
import com.aimentor.repository.RoadmapRepository;
import com.aimentor.repository.StudentProfileRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AIRoadmapService {

    private final ChatClient chatClient;
    private final StudentProfileRepository studentProfileRepository;
    private final RoadmapRepository roadmapRepository;
    private final RoadmapModuleRepository roadmapModuleRepository;
    private final LearningContentRepository learningContentRepository;
    private final ObjectMapper objectMapper;

    public AIRoadmapService(
            ChatClient.Builder chatClientBuilder,
            StudentProfileRepository studentProfileRepository,
            RoadmapRepository roadmapRepository,
            RoadmapModuleRepository roadmapModuleRepository,
            LearningContentRepository learningContentRepository,
            ObjectMapper objectMapper
    ) {

        this.chatClient = chatClientBuilder.build();
        this.studentProfileRepository = studentProfileRepository;
        this.roadmapRepository = roadmapRepository;
        this.roadmapModuleRepository = roadmapModuleRepository;
        this.learningContentRepository = learningContentRepository;
        this.objectMapper = objectMapper;
    }

    // =====================================================
    // GENERATE AI ROADMAP
    // =====================================================

    @Transactional
    public Roadmap generateRoadmap(
            Long studentId,
            String focusSkill
    ) {

        long startTime = System.currentTimeMillis();

        // =====================================================
        // VALIDATE
        // =====================================================

        if (studentId == null) {
            throw new IllegalArgumentException(
                    "Student ID is required."
            );
        }

        if (focusSkill == null ||
                focusSkill.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Focus skill is required."
            );
        }

        focusSkill = focusSkill.trim();

        System.out.println();
        System.out.println("==========================================");
        System.out.println("       GROQ AI ROADMAP GENERATION");
        System.out.println("==========================================");
        System.out.println("Student ID  : " + studentId);
        System.out.println("Focus Skill : " + focusSkill);
        System.out.println("AI Provider : Groq");
        System.out.println("==========================================");

        // =====================================================
        // GET STUDENT PROFILE
        // =====================================================

        StudentProfile profile =
                studentProfileRepository
                        .findByStudentId(studentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Student profile not found for student ID: "
                                                + studentId
                                )
                        );

        // =====================================================
        // PROFILE INFORMATION
        // =====================================================

        String careerGoal =
                profile.getCareerGoal() != null
                        ? profile.getCareerGoal().name()
                        : "Not specified";

        String experienceLevel =
                profile.getExperienceLevel() != null
                        ? profile.getExperienceLevel()
                        : "Beginner";

        Integer learningHours =
                profile.getLearningHoursPerDay() != null
                        ? profile.getLearningHoursPerDay()
                        : 2;

        System.out.println("Career Goal      : " + careerGoal);
        System.out.println("Experience Level : " + experienceLevel);
        System.out.println("Daily Hours      : " + learningHours);

        // =====================================================
        // BUILD GROQ PROMPT
        // =====================================================

        String prompt = buildRoadmapPrompt(
                focusSkill,
                careerGoal,
                experienceLevel,
                learningHours
        );

        // =====================================================
        // CALL GROQ
        // =====================================================

        String aiResponse;

        try {

            System.out.println();
            System.out.println("Sending roadmap request to Groq...");
            System.out.println(
                    "PRIMARY FOCUS SKILL = " + focusSkill
            );

            long aiStart = System.currentTimeMillis();

            aiResponse = chatClient
                    .prompt()
                    .user(prompt)
                    .call()
                    .content();

            long aiEnd = System.currentTimeMillis();

            System.out.println(
                    "Groq response received in "
                            + (aiEnd - aiStart)
                            + " ms"
            );

        } catch (Exception e) {

            System.err.println(
                    "Groq roadmap generation failed."
            );

            e.printStackTrace();

            throw new RuntimeException(
                    "Unable to generate AI roadmap using Groq: "
                            + e.getMessage(),
                    e
            );
        }

        // =====================================================
        // VALIDATE RESPONSE
        // =====================================================

        if (aiResponse == null ||
                aiResponse.trim().isEmpty()) {

            throw new RuntimeException(
                    "Groq returned an empty roadmap response."
            );
        }

        System.out.println();
        System.out.println(
                "Groq response received successfully."
        );

        System.out.println(
                "Response length: " + aiResponse.length()
        );

        // =====================================================
        // CLEAN JSON
        // =====================================================

        String cleanJson =
                cleanJsonResponse(aiResponse);

        // =====================================================
        // PARSE JSON
        // =====================================================

        JsonNode root;

        try {

            root = objectMapper.readTree(cleanJson);

        } catch (Exception e) {

            System.err.println(
                    "Invalid JSON returned by Groq:"
            );

            System.err.println(aiResponse);

            throw new RuntimeException(
                    "Groq returned invalid roadmap JSON.",
                    e
            );
        }

        // =====================================================
        // ROADMAP INFORMATION
        // =====================================================

        String title =
                getText(
                        root,
                        "title",
                        "Personalized "
                                + focusSkill
                                + " Learning Roadmap"
                );

        String description =
                getText(
                        root,
                        "description",
                        "Personalized learning roadmap focused on "
                                + focusSkill
                );

        int durationWeeks =
                getInt(
                        root,
                        "durationWeeks",
                        12
                );

        if (durationWeeks <= 0) {
            durationWeeks = 12;
        }

        // =====================================================
        // CREATE ROADMAP
        // =====================================================

        Roadmap roadmap =
                new Roadmap(
                        profile.getStudent(),
                        title,
                        description,
                        durationWeeks
                );

        // =====================================================
        // READ MODULES
        // =====================================================

        JsonNode modulesNode =
                root.get("modules");

        int moduleCount = 0;

        if (modulesNode != null &&
                modulesNode.isArray()) {

            for (JsonNode moduleNode : modulesNode) {

                // MODULE TITLE
                String moduleTitle =
                        getText(
                                moduleNode,
                                "title",
                                "Learn " + focusSkill
                        );

                // MODULE DESCRIPTION
                String moduleDescription =
                        getText(
                                moduleNode,
                                "description",
                                "Learn important concepts related to "
                                        + focusSkill
                        );

                // LEARNING CONTENT
                String learningContentText =
                        getText(
                                moduleNode,
                                "learningContent",
                                moduleDescription
                        );

                // WEEK
                int weekNumber =
                        getInt(
                                moduleNode,
                                "weekNumber",
                                moduleCount + 1
                        );

                if (weekNumber <= 0) {
                    weekNumber = moduleCount + 1;
                }

                // CREATE MODULE
                RoadmapModule module =
                        new RoadmapModule(
                                roadmap,
                                moduleTitle,
                                moduleDescription,
                                weekNumber
                        );

                roadmap.addModule(module);

                // CREATE LEARNING CONTENT
                createLearningContent(
                        module,
                        learningContentText
                );

                moduleCount++;
            }
        }

        // =====================================================
        // FALLBACK
        // =====================================================

        if (moduleCount == 0) {

            System.out.println(
                    "Groq returned no modules. Creating fallback modules."
            );

            createFallbackModules(
                    roadmap,
                    focusSkill
            );
        }

        // =====================================================
        // SAVE ROADMAP
        // =====================================================

        Roadmap savedRoadmap =
                roadmapRepository.save(roadmap);

        System.out.println();
        System.out.println(
                "Roadmap saved successfully."
        );

        System.out.println(
                "Roadmap ID: " + savedRoadmap.getId()
        );

        System.out.println(
                "Focus Skill: " + focusSkill
        );

        System.out.println(
                "Modules: "
                        + savedRoadmap
                        .getModules()
                        .size()
        );

        // =====================================================
        // DEBUG LEARNING CONTENT
        // =====================================================

        int totalLearningContent = 0;

        for (RoadmapModule module :
                savedRoadmap.getModules()) {

            int count =
                    module.getLearningContent() == null
                            ? 0
                            : module
                            .getLearningContent()
                            .size();

            System.out.println(
                    "Module ID: "
                            + module.getId()
                            + " | Title: "
                            + module.getTitle()
                            + " | Learning Content: "
                            + count
            );

            totalLearningContent += count;
        }

        System.out.println(
                "Total Learning Content: "
                        + totalLearningContent
        );

        long endTime =
                System.currentTimeMillis();

        System.out.println(
                "Generation time: "
                        + (endTime - startTime)
                        + " ms"
        );

        System.out.println(
                "=========================================="
        );

        return savedRoadmap;
    }

    // =====================================================
    // OLD METHOD
    // =====================================================

    @Transactional
    public Roadmap generateRoadmap(Long studentId) {

        throw new IllegalArgumentException(
                "Focus skill is required. "
                        + "Use generateRoadmap(studentId, focusSkill)."
        );
    }

    // =====================================================
    // CREATE LEARNING CONTENT
    // =====================================================

    private void createLearningContent(
            RoadmapModule module,
            String learningContentText
    ) {

        if (learningContentText == null ||
                learningContentText.trim().isEmpty()) {

            learningContentText =
                    module.getDescription();
        }

        LearningContent content =
                new LearningContent(
                        module,
                        "Learning Content",
                        getDefaultLearningContentType(),
                        learningContentText,
                        null,
                        1
                );

        module.addLearningContent(content);

        System.out.println(
                "Learning content created for module: "
                        + module.getTitle()
        );
    }

    // =====================================================
    // LEARNING CONTENT TYPE
    // =====================================================

    private LearningContentType
    getDefaultLearningContentType() {

        try {

            return LearningContentType.valueOf("TEXT");

        } catch (Exception ignored) {

            LearningContentType[] values =
                    LearningContentType.values();

            if (values.length == 0) {

                throw new RuntimeException(
                        "LearningContentType enum has no values."
                );
            }

            return values[0];
        }
    }

    // =====================================================
    // GROQ PROMPT
    // =====================================================

    private String buildRoadmapPrompt(
            String focusSkill,
            String careerGoal,
            String experienceLevel,
            Integer learningHours
    ) {

        return """
                You are an expert AI career mentor and learning roadmap generator.

                Create a practical personalized learning roadmap.

                =====================================================
                PRIMARY FOCUS SKILL
                =====================================================

                %s

                =====================================================
                STUDENT INFORMATION
                =====================================================

                Career Goal:
                %s

                Experience Level:
                %s

                Daily Learning Hours:
                %d

                =====================================================
                ABSOLUTE PRIORITY RULE
                =====================================================

                The PRIMARY FOCUS SKILL is the most important input.

                The entire roadmap MUST be centered around:

                %s

                The career goal is supporting context only.

                NEVER replace the primary focus skill with the career goal.

                NEVER generate a generic Software Engineering roadmap.

                NEVER generate Data Analytics, Data Science,
                Machine Learning, Java, React, Cloud, Cyber Security,
                or another unrelated roadmap unless it directly supports
                the PRIMARY FOCUS SKILL.

                If the PRIMARY FOCUS SKILL is Python,
                the roadmap must primarily teach Python.

                If the PRIMARY FOCUS SKILL is Java,
                the roadmap must primarily teach Java.

                If the PRIMARY FOCUS SKILL is React,
                the roadmap must primarily teach React.

                If the PRIMARY FOCUS SKILL is Artificial Intelligence,
                the roadmap must primarily teach Artificial Intelligence.

                If the PRIMARY FOCUS SKILL is Machine Learning,
                the roadmap must primarily teach Machine Learning.

                If the PRIMARY FOCUS SKILL is SQL,
                the roadmap must primarily teach SQL.

                =====================================================
                ROADMAP RULES
                =====================================================

                1. Create 8 to 12 meaningful modules.

                2. Progress from fundamentals to advanced concepts.

                3. Include practical exercises.

                4. Include real-world projects.

                5. Respect experience level.

                6. Consider daily learning hours.

                7. Supporting technologies are allowed only
                   when they directly support the primary focus skill.

                8. Every module must be specific to the primary focus skill.

                9. Every module must contain learningContent.

                10. learningContent must explain exactly what
                    the student should study.

                11. learningContent must include:

                    - Key concepts
                    - Important topics
                    - Practical learning
                    - Coding/practice guidance
                    - Real-world applications

                12. Each module must have a unique week number.

                13. Return ONLY valid JSON.

                =====================================================
                REQUIRED JSON
                =====================================================

                {
                  "title": "Personalized %s Learning Roadmap",
                  "description": "Personalized roadmap focused on %s",
                  "durationWeeks": 12,
                  "modules": [
                    {
                      "title": "Module title",
                      "description": "What the student will learn",
                      "learningContent": "Detailed learning content specific to this module",
                      "weekNumber": 1
                    }
                  ]
                }

                =====================================================
                FINAL VALIDATION
                =====================================================

                Before returning:

                - Verify every module belongs to the PRIMARY FOCUS SKILL.
                - Verify every learningContent belongs to that module.
                - Verify no unrelated career replaces the focus skill.
                - Verify the title contains the focus skill.
                - Verify 8 to 12 modules exist.
                - Verify valid JSON.
                - No Markdown.
                - No explanation outside JSON.

                Return ONLY JSON.

                """.formatted(
                focusSkill,
                careerGoal,
                experienceLevel,
                learningHours,
                focusSkill,
                focusSkill,
                focusSkill
        );
    }

    // =====================================================
    // CLEAN JSON
    // =====================================================

    private String cleanJsonResponse(String response) {

        String json = response.trim();

        if (json.startsWith("```")) {

            int firstNewLine =
                    json.indexOf("\n");

            if (firstNewLine != -1) {

                json =
                        json.substring(
                                firstNewLine + 1
                        );
            }

            if (json.endsWith("```")) {

                json =
                        json.substring(
                                0,
                                json.length() - 3
                        );
            }
        }

        json = json.trim();

        int start = json.indexOf("{");
        int end = json.lastIndexOf("}");

        if (start >= 0 &&
                end > start) {

            json =
                    json.substring(
                            start,
                            end + 1
                    );
        }

        return json.trim();
    }

    // =====================================================
    // GET TEXT
    // =====================================================

    private String getText(
            JsonNode node,
            String field,
            String defaultValue
    ) {

        if (node == null) {
            return defaultValue;
        }

        JsonNode value =
                node.get(field);

        if (value == null ||
                value.isNull()) {

            return defaultValue;
        }

        String text =
                value.asText();

        if (text == null ||
                text.trim().isEmpty()) {

            return defaultValue;
        }

        return text.trim();
    }

    // =====================================================
    // GET INTEGER
    // =====================================================

    private int getInt(
            JsonNode node,
            String field,
            int defaultValue
    ) {

        if (node == null) {
            return defaultValue;
        }

        JsonNode value =
                node.get(field);

        if (value == null ||
                value.isNull()) {

            return defaultValue;
        }

        if (value.isNumber()) {
            return value.asInt();
        }

        try {

            return Integer.parseInt(
                    value.asText().trim()
            );

        } catch (Exception e) {

            return defaultValue;
        }
    }

    // =====================================================
    // FALLBACK MODULES
    // =====================================================

    private void createFallbackModules(
            Roadmap roadmap,
            String focusSkill
    ) {

        String[] topics = {

                "Fundamentals of " + focusSkill,

                "Core Concepts of " + focusSkill,

                "Intermediate " + focusSkill,

                "Advanced " + focusSkill,

                "Practical Development with " + focusSkill,

                focusSkill + " Project Development",

                "Advanced Project with " + focusSkill,

                "Final " + focusSkill + " Project"
        };

        for (int i = 0;
             i < topics.length;
             i++) {

            String moduleDescription =
                    "Learn and practice "
                            + topics[i]
                            + " through practical exercises and projects.";

            String learningContentText =
                    "Study the fundamentals and important concepts of "
                            + topics[i]
                            + ". Practice the concepts with coding exercises, "
                            + "build practical examples, and understand "
                            + "how these concepts are used in real-world "
                            + focusSkill
                            + " development.";

            RoadmapModule module =
                    new RoadmapModule(
                            roadmap,
                            topics[i],
                            moduleDescription,
                            i + 1
                    );

            roadmap.addModule(module);

            createLearningContent(
                    module,
                    learningContentText
            );
        }
    }
}