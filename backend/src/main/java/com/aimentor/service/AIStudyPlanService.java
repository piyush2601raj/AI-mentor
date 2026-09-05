package com.aimentor.service;

import com.aimentor.dto.AIStudyPlanResponse;
import com.aimentor.dto.StudentDashboardResponse;
import com.aimentor.entity.StudentProfile;
import com.aimentor.entity.StudentSkill;
import com.aimentor.repository.StudentProfileRepository;
import com.aimentor.repository.StudentSkillRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AIStudyPlanService {

    private final StudentProfileRepository profileRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final StudentDashboardService dashboardService;
    private final ChatClient chatClient;

    public AIStudyPlanService(
            StudentProfileRepository profileRepository,
            StudentSkillRepository studentSkillRepository,
            StudentDashboardService dashboardService,
            ChatClient.Builder chatClientBuilder) {

        this.profileRepository = profileRepository;
        this.studentSkillRepository = studentSkillRepository;
        this.dashboardService = dashboardService;
        this.chatClient = chatClientBuilder.build();
    }

    public AIStudyPlanResponse generateStudyPlan(
            Long studentId) {

        StudentProfile profile =
                profileRepository.findByStudentId(studentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Student profile not found"));

        List<StudentSkill> studentSkills =
                studentSkillRepository
                        .findByStudentId(studentId);

        StudentDashboardResponse dashboard =
                dashboardService.getDashboard(studentId);

        String skillsContext = studentSkills.stream()
                .map(skill ->
                        skill.getSkill().getName()
                                + " - "
                                + skill.getSkillLevel()
                                + " - Category: "
                                + skill.getSkill().getCategory())
                .collect(Collectors.joining("\n"));

        if (skillsContext.isBlank()) {
            skillsContext = "No skills have been added yet.";
        }

        String prompt = """
                You are an AI learning mentor for a personalized
                student learning platform.

                Create a realistic and personalized study plan
                based on the student's profile, skills, roadmap
                progress and quiz performance.

                STUDENT PROFILE

                Student ID:
                %d

                Career Goal:
                %s

                Experience Level:
                %s

                Daily Study Hours:
                %d hours

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

                TASK

                Based on all the information above:

                1. Identify the most important skills the student
                   should focus on.
                2. Create a practical weekly study plan.
                3. Consider the student's available daily study time.
                4. Consider their current skill levels.
                5. Consider their roadmap progress.
                6. Consider their quiz performance.
                7. Keep the plan realistic for the student's
                   current experience level.

                Return ONLY a structured response with:

                goal
                focusAreas
                weeklyPlan
                recommendation

                The weeklyPlan should contain practical,
                actionable learning activities.

                Do not include markdown.
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
                        dashboard.getLatestQuizPassed())
        );

        AIStudyPlanResponse aiPlan =
                chatClient
                        .prompt()
                        .user(prompt)
                        .call()
                        .entity(AIStudyPlanResponse.class);

        aiPlan.setStudentId(studentId);

        return aiPlan;
    }
}