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

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AIRoadmapService {

    private final ChatClient chatClient;

    private final StudentProfileRepository studentProfileRepository;

    private final RoadmapRepository roadmapRepository;

    private final RoadmapModuleRepository roadmapModuleRepository;

    private final LearningContentRepository learningContentRepository;

    /*
     * Kept to avoid unnecessary constructor changes.
     * Structured output now handles AI JSON conversion.
     */
    private final ObjectMapper objectMapper;


    // =====================================================
    // STRUCTURED AI RESPONSE
    // =====================================================

    public record AIRoadmapResponse(

            String title,

            String description,

            Integer durationWeeks,

            List<AIRoadmapModule> modules

    ) {
    }


    public record AIRoadmapModule(

            String title,

            String description,

            String learningContent,

            Integer weekNumber

    ) {
    }


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public AIRoadmapService(
            ChatClient.Builder chatClientBuilder,
            StudentProfileRepository studentProfileRepository,
            RoadmapRepository roadmapRepository,
            RoadmapModuleRepository roadmapModuleRepository,
            LearningContentRepository learningContentRepository,
            ObjectMapper objectMapper
    ) {

        this.chatClient =
                chatClientBuilder.build();

        this.studentProfileRepository =
                studentProfileRepository;

        this.roadmapRepository =
                roadmapRepository;

        this.roadmapModuleRepository =
                roadmapModuleRepository;

        this.learningContentRepository =
                learningContentRepository;

        this.objectMapper =
                objectMapper;
    }


    // =====================================================
    // GENERATE AI ROADMAP
    // =====================================================

    @Transactional
    public Roadmap generateRoadmap(
            Long studentId,
            String focusSkill
    ) {

        long startTime =
                System.currentTimeMillis();


        // =====================================================
        // VALIDATE INPUT
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


        focusSkill =
                focusSkill.trim();


        System.out.println();

        System.out.println(
                "=========================================="
        );

        System.out.println(
                "       GROQ AI ROADMAP GENERATION"
        );

        System.out.println(
                "=========================================="
        );

        System.out.println(
                "Student ID  : " + studentId
        );

        System.out.println(
                "Focus Skill : " + focusSkill
        );

        System.out.println(
                "AI Provider : Groq"
        );

        System.out.println(
                "=========================================="
        );


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


        System.out.println(
                "Career Goal      : " + careerGoal
        );

        System.out.println(
                "Experience Level : " + experienceLevel
        );

        System.out.println(
                "Daily Learning Hours : " + learningHours
        );


        // =====================================================
        // BUILD GROQ PROMPT
        // =====================================================

        String prompt =
                buildRoadmapPrompt(
                        focusSkill,
                        careerGoal,
                        experienceLevel,
                        learningHours
                );


        // =====================================================
        // CALL GROQ USING STRUCTURED OUTPUT
        // =====================================================

        AIRoadmapResponse aiRoadmap;


        try {

            System.out.println();

            System.out.println(
                    "Sending structured roadmap request to Groq..."
            );

            System.out.println(
                    "PRIMARY FOCUS SKILL = "
                            + focusSkill
            );


            long aiStart =
                    System.currentTimeMillis();


            /*
             * IMPORTANT:
             *
             * We no longer use:
             *
             * .content()
             *
             * followed by manual JSON parsing.
             *
             * Spring AI converts the model response directly
             * into AIRoadmapResponse.
             *
             * validateSchema() enables automatic retry when
             * the AI returns malformed structured output.
             */

            aiRoadmap =
                    chatClient

                            .prompt()

                            .user(prompt)

                            .call()

                            .entity(
                                    AIRoadmapResponse.class,
                                    spec ->
                                            spec.validateSchema()
                            );


            long aiEnd =
                    System.currentTimeMillis();


            System.out.println(
                    "Structured Groq response received in "
                            + (aiEnd - aiStart)
                            + " ms"
            );


        } catch (Exception e) {

            System.err.println(
                    "Groq structured roadmap generation failed."
            );

            e.printStackTrace();


            throw new RuntimeException(
                    "Unable to generate a valid AI roadmap using Groq: "
                            + e.getMessage(),
                    e
            );
        }


        // =====================================================
        // VALIDATE AI RESPONSE
        // =====================================================

        if (aiRoadmap == null) {

            throw new RuntimeException(
                    "Groq returned an empty roadmap."
            );
        }


        // =====================================================
        // ROADMAP INFORMATION
        // =====================================================

        String title;


        if (aiRoadmap.title() != null &&
                !aiRoadmap.title().trim().isEmpty()) {

            title =
                    aiRoadmap.title().trim();

        } else {

            title =
                    "Personalized "
                            + focusSkill
                            + " Learning Roadmap";
        }


        String description;


        if (aiRoadmap.description() != null &&
                !aiRoadmap.description().trim().isEmpty()) {

            description =
                    aiRoadmap.description().trim();

        } else {

            description =
                    "Personalized learning roadmap focused on "
                            + focusSkill;
        }


        int durationWeeks;


        if (aiRoadmap.durationWeeks() != null &&
                aiRoadmap.durationWeeks() > 0) {

            durationWeeks =
                    aiRoadmap.durationWeeks();

        } else {

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
        // READ AI MODULES
        // =====================================================

        List<AIRoadmapModule> aiModules;


        if (aiRoadmap.modules() != null) {

            aiModules =
                    aiRoadmap.modules();

        } else {

            aiModules =
                    List.of();
        }


        int moduleCount = 0;


        for (AIRoadmapModule moduleData :
                aiModules) {


            if (moduleData == null) {
                continue;
            }


            // =================================================
            // MODULE TITLE
            // =================================================

            String moduleTitle;


            if (moduleData.title() != null &&
                    !moduleData.title()
                            .trim()
                            .isEmpty()) {

                moduleTitle =
                        moduleData.title()
                                .trim();

            } else {

                moduleTitle =
                        "Learn "
                                + focusSkill;
            }


            // =================================================
            // MODULE DESCRIPTION
            // =================================================

            String moduleDescription;


            if (moduleData.description() != null &&
                    !moduleData.description()
                            .trim()
                            .isEmpty()) {

                moduleDescription =
                        moduleData.description()
                                .trim();

            } else {

                moduleDescription =
                        "Learn important concepts related to "
                                + focusSkill;
            }


            // =================================================
            // LEARNING CONTENT
            // =================================================

            String learningContentText;


            if (moduleData.learningContent() != null &&
                    !moduleData.learningContent()
                            .trim()
                            .isEmpty()) {

                learningContentText =
                        moduleData.learningContent()
                                .trim();

            } else {

                learningContentText =
                        moduleDescription;
            }


            // =================================================
            // WEEK NUMBER
            // =================================================

            int weekNumber;


            if (moduleData.weekNumber() != null &&
                    moduleData.weekNumber() > 0) {

                weekNumber =
                        moduleData.weekNumber();

            } else {

                weekNumber =
                        moduleCount + 1;
            }


            // =================================================
            // CREATE ROADMAP MODULE
            // =================================================

            RoadmapModule module =
                    new RoadmapModule(
                            roadmap,
                            moduleTitle,
                            moduleDescription,
                            weekNumber
                    );


            roadmap.addModule(
                    module
            );


            // =================================================
            // CREATE LEARNING CONTENT
            // =================================================

            createLearningContent(
                    module,
                    learningContentText
            );


            moduleCount++;
        }


        // =====================================================
        // FALLBACK MODULES
        // =====================================================

        if (moduleCount == 0) {

            System.out.println(
                    "Groq returned no modules. "
                            + "Creating fallback modules."
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
                roadmapRepository.save(
                        roadmap
                );


        System.out.println();

        System.out.println(
                "Roadmap saved successfully."
        );


        System.out.println(
                "Roadmap ID: "
                        + savedRoadmap.getId()
        );


        System.out.println(
                "Focus Skill: "
                        + focusSkill
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


            totalLearningContent +=
                    count;
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
    public Roadmap generateRoadmap(
            Long studentId
    ) {

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
                learningContentText
                        .trim()
                        .isEmpty()) {

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


        module.addLearningContent(
                content
        );


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

            return LearningContentType.valueOf(
                    "TEXT"
            );

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

                Create a practical, personalized learning roadmap.

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

                5. Respect the student's experience level.

                6. Consider the student's daily learning hours.

                7. Supporting technologies are allowed only when
                   they directly support the primary focus skill.

                8. Every module must be specific to the primary
                   focus skill.

                9. Every module must contain learningContent.

                10. learningContent must explain exactly what
                    the student should study.

                11. learningContent should include:

                    - Key concepts
                    - Important topics
                    - Practical learning
                    - Coding/practice guidance
                    - Real-world applications

                12. Each module must have a unique week number.

                =====================================================
                OUTPUT STRUCTURE
                =====================================================

                The response must contain these fields:

                title
                description
                durationWeeks
                modules

                Each module must contain:

                title
                description
                learningContent
                weekNumber

                Do not add unrelated fields.

                =====================================================
                FINAL VALIDATION
                =====================================================

                Before returning the result:

                - Verify every module belongs to the PRIMARY FOCUS SKILL.
                - Verify every learningContent belongs to its module.
                - Verify the title contains the focus skill.
                - Verify the roadmap is personalized to the student.
                - Verify 8 to 12 modules are created.
                - Verify every module has a unique weekNumber.
                - Verify learningContent is meaningful and practical.
                - Do not include explanations outside the structured response.

                Return only the structured roadmap.

                """.formatted(
                focusSkill,
                careerGoal,
                experienceLevel,
                learningHours,
                focusSkill
        );
    }


    // =====================================================
    // GET TEXT
    // =====================================================

    private String getText(
            com.fasterxml.jackson.databind.JsonNode node,
            String field,
            String defaultValue
    ) {

        if (node == null) {
            return defaultValue;
        }


        com.fasterxml.jackson.databind.JsonNode value =
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
            com.fasterxml.jackson.databind.JsonNode node,
            String field,
            int defaultValue
    ) {

        if (node == null) {
            return defaultValue;
        }


        com.fasterxml.jackson.databind.JsonNode value =
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


            roadmap.addModule(
                    module
            );


            createLearningContent(
                    module,
                    learningContentText
            );
        }
    }
}