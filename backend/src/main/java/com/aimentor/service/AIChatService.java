package com.aimentor.service;

import com.aimentor.dto.AIChatHistoryResponse;
import com.aimentor.dto.AIChatRequest;
import com.aimentor.dto.AIChatResponse;
import com.aimentor.dto.StudentDashboardResponse;
import com.aimentor.entity.AIChatMessage;
import com.aimentor.entity.StudentProfile;
import com.aimentor.entity.StudentSkill;
import com.aimentor.entity.User;
import com.aimentor.repository.AIChatMessageRepository;
import com.aimentor.repository.StudentProfileRepository;
import com.aimentor.repository.StudentSkillRepository;
import com.aimentor.repository.UserRepository;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AIChatService {

    private final StudentProfileRepository profileRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final StudentDashboardService dashboardService;
    private final ChatClient chatClient;

    private final AIChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    public AIChatService(
            StudentProfileRepository profileRepository,
            StudentSkillRepository studentSkillRepository,
            StudentDashboardService dashboardService,
            ChatClient.Builder chatClientBuilder,
            AIChatMessageRepository chatMessageRepository,
            UserRepository userRepository) {

        this.profileRepository = profileRepository;
        this.studentSkillRepository = studentSkillRepository;
        this.dashboardService = dashboardService;
        this.chatClient = chatClientBuilder.build();

        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
    }

    public AIChatResponse chat(AIChatRequest request) {

        Long studentId = request.getStudentId();

        if (studentId == null) {
            throw new RuntimeException("Student ID is required");
        }

        if (request.getMessage() == null
                || request.getMessage().trim().isEmpty()) {

            throw new RuntimeException("Message is required");
        }

        StudentProfile profile =
                profileRepository.findByStudentId(studentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Student profile not found"));

        List<StudentSkill> skills =
                studentSkillRepository
                        .findByStudentId(studentId);

        StudentDashboardResponse dashboard =
                dashboardService.getDashboard(studentId);

        String skillsContext = skills.stream()
                .map(skill ->
                        skill.getSkill().getName()
                                + " - Level: "
                                + skill.getSkillLevel()
                                + " - Category: "
                                + skill.getSkill().getCategory())
                .collect(Collectors.joining("\n"));

        if (skillsContext.isBlank()) {
            skillsContext = "No skills added yet.";
        }

        String prompt = """
                You are an AI Mentor inside a personalized
                learning platform.

                Your job is to help the student understand concepts,
                solve learning problems, plan their studies and
                improve their skills.

                IMPORTANT:
                - Give practical and understandable explanations.
                - Adapt your answer to the student's experience level.
                - Consider the student's career goal.
                - Consider their available daily study hours.
                - Consider their current skills and skill levels.
                - Consider their roadmap progress.
                - Consider their quiz performance.
                - Do not overwhelm the student with unnecessary
                  information.
                - If the student asks for a learning plan, provide
                  actionable steps.
                - If the student asks a technical question, explain
                  the concept clearly and provide examples when useful.

                STUDENT PROFILE

                Student ID:
                %d

                Career Goal:
                %s

                Experience Level:
                %s

                Daily Study Hours:
                %d

                CURRENT SKILLS

                %s

                ROADMAP PROGRESS

                Total Modules:
                %d

                Completed Modules:
                %d

                Roadmap Progress:
                %.2f%%

                QUIZ PERFORMANCE

                Total Quiz Attempts:
                %d

                Passed Quizzes:
                %d

                Latest Quiz Score:
                %s

                Latest Quiz Percentage:
                %s

                Latest Quiz Passed:
                %s

                STUDENT QUESTION

                %s

                Answer the student's question as their
                personalized AI mentor.
                """.formatted(
                studentId,
                profile.getCareerGoal(),
                profile.getExperienceLevel(),
                profile.getLearningHoursPerDay(),
                skillsContext,
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
                        dashboard.getLatestQuizPassed()),
                request.getMessage().trim()
        );

        // Generate AI response
        String aiResponse = chatClient
                .prompt()
                .user(prompt)
                .call()
                .content();

        // Save chat history
        User student = userRepository.findById(studentId)
                .orElseThrow(() ->
                        new RuntimeException("Student not found"));

        AIChatMessage chatMessage =
                new AIChatMessage(
                        student,
                        request.getMessage().trim(),
                        aiResponse
                );

        chatMessageRepository.save(chatMessage);

        return new AIChatResponse(
                studentId,
                aiResponse
        );
    }

    public List<AIChatHistoryResponse> getChatHistory(
            Long studentId) {

        userRepository.findById(studentId)
                .orElseThrow(() ->
                        new RuntimeException("Student not found"));

        return chatMessageRepository
                .findByStudentIdOrderByCreatedAtDesc(studentId)
                .stream()
                .map(chat -> {

                    return new AIChatHistoryResponse(
                            chat.getId(),
                            studentId,
                            chat.getUserMessage(),
                            chat.getAiResponse(),
                            chat.getCreatedAt()
                    );

                })
                .collect(Collectors.toList());
    }
}