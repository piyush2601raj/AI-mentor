package com.aimentor.service;

import com.aimentor.entity.LearningContent;
import com.aimentor.entity.LearningContentType;
import com.aimentor.entity.RoadmapModule;
import com.aimentor.repository.LearningContentRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class LearningContentGeneratorService {

    private final LearningContentRepository learningContentRepository;

    public LearningContentGeneratorService(
            LearningContentRepository learningContentRepository
    ) {

        this.learningContentRepository =
                learningContentRepository;
    }

    // =====================================================
    // GENERATE / ENSURE CONTENT FOR MODULE
    // =====================================================

    @Transactional
    public List<LearningContent> generateForModule(
            RoadmapModule module
    ) {

        if (module == null || module.getId() == null) {

            throw new IllegalArgumentException(
                    "Module is required"
            );
        }

        String moduleTitle =
                module.getTitle() == null
                        ? "Learning Module"
                        : module.getTitle().trim();

        String moduleDescription =
                module.getDescription() == null
                        ? ""
                        : module.getDescription().trim();

        // =================================================
        // GET EXISTING CONTENT
        // =================================================

        List<LearningContent> existingContents =
                learningContentRepository
                        .findByModuleIdOrderByContentOrderAsc(
                                module.getId()
                        );

        // =================================================
        // DETERMINE EXPECTED LESSONS
        // =================================================

        List<String> lessonTitles =
                generateLessonTitles(
                        moduleTitle,
                        moduleDescription
                );

        // =================================================
        // NO CONTENT
        // =================================================

        if (existingContents.isEmpty()) {

            return createLessons(
                    module,
                    moduleTitle,
                    moduleDescription,
                    lessonTitles
            );
        }

        // =================================================
        // OLD SINGLE PLACEHOLDER CONTENT
        // =================================================
        /*
         * Earlier versions of the application could create
         * one generic "Learning Content" lesson.
         *
         * If that is the only content and it has not been
         * completed, safely replace it with the proper
         * generated lesson set.
         */

        if (existingContents.size() == 1) {

            LearningContent existing =
                    existingContents.get(0);

            boolean placeholder =
                    isPlaceholderLesson(
                            existing
                    );

            if (placeholder &&
                    !existing.isCompleted()) {

                learningContentRepository
                        .deleteByModuleId(
                                module.getId()
                        );

                learningContentRepository.flush();

                return createLessons(
                        module,
                        moduleTitle,
                        moduleDescription,
                        lessonTitles
                );
            }

            // =============================================
            // Existing valid lesson
            // =============================================

            return existingContents;
        }

        // =================================================
        // MULTIPLE CONTENT ALREADY EXISTS
        // =================================================

        return existingContents;
    }

    // =====================================================
    // CREATE LESSONS
    // =====================================================

    private List<LearningContent> createLessons(
            RoadmapModule module,
            String moduleTitle,
            String moduleDescription,
            List<String> lessonTitles
    ) {

        List<LearningContent> contents =
                new ArrayList<>();

        int order = 1;

        for (String lessonTitle : lessonTitles) {

            String lessonContent =
                    generateLessonContent(
                            moduleTitle,
                            lessonTitle,
                            moduleDescription
                    );

            String resourceUrl =
                    generateResourceUrl(
                            moduleTitle,
                            lessonTitle
                    );

            LearningContent content =
                    new LearningContent(
                            module,
                            lessonTitle,
                            LearningContentType.LESSON,
                            lessonContent,
                            resourceUrl,
                            order
                    );

            contents.add(content);

            order++;
        }

        return learningContentRepository
                .saveAll(contents);
    }

    // =====================================================
    // PLACEHOLDER DETECTION
    // =====================================================

    private boolean isPlaceholderLesson(
            LearningContent content
    ) {

        if (content == null) {
            return false;
        }

        String title =
                content.getTitle() == null
                        ? ""
                        : content.getTitle()
                        .trim()
                        .toLowerCase();

        return title.equals("learning content")
                || title.equals("lesson")
                || title.equals("content")
                || title.isBlank();
    }

    // =====================================================
    // LESSON TITLES
    // =====================================================

    private List<String> generateLessonTitles(
            String moduleTitle,
            String description
    ) {

        List<String> titles =
                new ArrayList<>();

        String title =
                moduleTitle == null
                        ? ""
                        : moduleTitle.toLowerCase();

        // =================================================
        // GO
        // =================================================

        if (title.contains("go")) {

            titles.add("Introduction and Setup");
            titles.add("Variables and Data Types");
            titles.add("Functions");
            titles.add("Control Flow");
            titles.add("Arrays and Slices");
            titles.add("Structs and Interfaces");
            titles.add("Error Handling");
            titles.add("Concurrency with Goroutines");
            titles.add("Practical Go Project");

            return titles;
        }

        // =================================================
        // JAVA
        // =================================================

        if (title.contains("java")) {

            titles.add(
                    "Introduction and Environment Setup"
            );

            titles.add(
                    "Variables and Data Types"
            );

            titles.add(
                    "Operators and Control Flow"
            );

            titles.add(
                    "Methods and Functions"
            );

            titles.add(
                    "Object Oriented Programming"
            );

            titles.add(
                    "Inheritance and Polymorphism"
            );

            titles.add(
                    "Exception Handling"
            );

            titles.add(
                    "Collections and Generics"
            );

            titles.add(
                    "Practical Java Project"
            );

            return titles;
        }

        // =================================================
        // SPRING BOOT
        // =================================================

        if (title.contains("spring")) {

            titles.add(
                    "Introduction to Spring Boot"
            );

            titles.add(
                    "Project Setup and Dependencies"
            );

            titles.add(
                    "REST Controllers"
            );

            titles.add(
                    "Services and Dependency Injection"
            );

            titles.add(
                    "JPA and Hibernate"
            );

            titles.add(
                    "Database Integration"
            );

            titles.add(
                    "Exception Handling"
            );

            titles.add(
                    "Spring Security"
            );

            titles.add(
                    "Building a Production REST API"
            );

            return titles;
        }

        // =================================================
        // REACT
        // =================================================

        if (title.contains("react")) {

            titles.add(
                    "Introduction to React"
            );

            titles.add(
                    "Components and JSX"
            );

            titles.add(
                    "Props and State"
            );

            titles.add(
                    "Event Handling"
            );

            titles.add(
                    "Hooks"
            );

            titles.add(
                    "React Router"
            );

            titles.add(
                    "API Integration"
            );

            titles.add(
                    "State Management and Best Practices"
            );

            titles.add(
                    "Building a React Application"
            );

            return titles;
        }

        // =================================================
        // TYPESCRIPT
        // =================================================

        if (title.contains("typescript")
                || title.contains("type script")) {

            titles.add(
                    "Introduction to TypeScript"
            );

            titles.add(
                    "Types and Type Inference"
            );

            titles.add(
                    "Interfaces and Type Aliases"
            );

            titles.add(
                    "Functions and Parameters"
            );

            titles.add(
                    "Objects and Classes"
            );

            titles.add(
                    "Generics"
            );

            titles.add(
                    "Union, Intersection and Type Guards"
            );

            titles.add(
                    "Modules and Configuration"
            );

            titles.add(
                    "TypeScript with React and Node.js"
            );

            titles.add(
                    "Practical TypeScript Project"
            );

            return titles;
        }

        // =================================================
        // DATABASE / SQL
        // =================================================

        if (title.contains("database")
                || title.contains("sql")
                || title.contains("postgres")
                || title.contains("mysql")) {

            titles.add(
                    "Database Fundamentals"
            );

            titles.add(
                    "Tables and Relationships"
            );

            titles.add(
                    "SQL Queries"
            );

            titles.add(
                    "Joins"
            );

            titles.add(
                    "Indexes"
            );

            titles.add(
                    "Normalization"
            );

            titles.add(
                    "Transactions"
            );

            titles.add(
                    "Query Optimization"
            );

            titles.add(
                    "Practical Database Project"
            );

            return titles;
        }

        // =================================================
        // GENERIC DYNAMIC MODULE
        // =================================================

        titles.add(
                "Introduction and Fundamentals"
        );

        titles.add(
                "Core Concepts"
        );

        titles.add(
                "Important Concepts and Terminology"
        );

        titles.add(
                "Working with the Core Features"
        );

        titles.add(
                "Practical Examples"
        );

        titles.add(
                "Common Problems and Solutions"
        );

        titles.add(
                "Best Practices"
        );

        titles.add(
                "Hands-on Practice"
        );

        titles.add(
                "Real-World Application"
        );

        titles.add(
                "Mini Project"
        );

        return titles;
    }

    // =====================================================
    // LESSON CONTENT
    // =====================================================

    private String generateLessonContent(
            String moduleTitle,
            String lessonTitle,
            String description
    ) {

        StringBuilder content =
                new StringBuilder();

        content.append("# ")
                .append(lessonTitle)
                .append("\n\n");

        content.append(
                "## Overview\n\n"
        );

        content.append(
                "This lesson is part of the **"
        )
                .append(moduleTitle)
                .append(
                        "** learning module. "
                )
                .append(
                        "The goal is to understand the "
                                + "concept clearly and apply it "
                                + "in a practical development scenario.\n\n"
                );

        if (description != null &&
                !description.isBlank()) {

            content.append(
                    "## Module Context\n\n"
            );

            content.append(
                    description
            )
                    .append("\n\n");
        }

        content.append(
                "## Key Concepts\n\n"
        );

        content.append(
                "- Understand the fundamental concepts.\n"
        );

        content.append(
                "- Learn how the concept works internally.\n"
        );

        content.append(
                "- Understand when and why it is used.\n"
        );

        content.append(
                "- Learn the common patterns and mistakes.\n"
        );

        content.append(
                "- Apply the concept using practical examples.\n\n"
        );

        content.append(
                "## Important Topics\n\n"
        );

        content.append(
                "Focus on the terminology, syntax, "
                        + "patterns and development practices "
                        + "associated with this lesson.\n\n"
        );

        content.append(
                "## Practical Learning\n\n"
        );

        content.append(
                "Start with a small example and gradually "
                        + "increase the complexity. Focus on "
                        + "understanding the behaviour rather "
                        + "than memorising syntax.\n\n"
        );

        content.append(
                "## Coding / Practice Guidance\n\n"
        );

        content.append(
                "Create a small implementation related to "
                        + "**"
        )
                .append(lessonTitle)
                .append(
                        "**. Test different inputs and verify "
                                + "the expected behaviour.\n\n"
                );

        content.append(
                "## Real-World Applications\n\n"
        );

        content.append(
                "Think about how this concept can be used "
                        + "inside a real software project. "
                        + "Identify where it can improve "
                        + "maintainability, performance, "
                        + "scalability or developer productivity.\n\n"
        );

        content.append(
                "## Practice Task\n\n"
        );

        content.append(
                "Build a small practical example based on "
                        + "**"
        )
                .append(lessonTitle)
                .append(
                        "** and verify the output.\n\n"
                );

        content.append(
                "## Learning Tip\n\n"
        );

        content.append(
                "Do not move to the next lesson until you "
                        + "can explain the main concept in your "
                        + "own words and implement a small "
                        + "working example.\n\n"
        );

        content.append(
                "## Next Step\n\n"
        );

        content.append(
                "Complete the practice task and continue "
                        + "to the next lesson."
        );

        return content.toString();
    }

    // =====================================================
    // RESOURCE URL
    // =====================================================

    private String generateResourceUrl(
            String moduleTitle,
            String lessonTitle
    ) {

        String title =
                moduleTitle == null
                        ? ""
                        : moduleTitle.toLowerCase();

        if (title.contains("go")) {

            return "https://go.dev/tour/";
        }

        if (title.contains("java")) {

            return "https://dev.java/learn/";
        }

        if (title.contains("spring")) {

            return "https://spring.io/guides";
        }

        if (title.contains("react")) {

            return "https://react.dev/learn";
        }

        if (title.contains("typescript")) {

            return "https://www.typescriptlang.org/docs/";
        }

        if (title.contains("sql")
                || title.contains("database")
                || title.contains("postgres")) {

            return "https://www.postgresql.org/docs/";
        }

        return null;
    }
}