package com.aimentor.service;

import com.aimentor.dto.StudentDashboardResponse;
import com.aimentor.entity.ModuleStatus;
import com.aimentor.entity.Roadmap;
import com.aimentor.entity.RoadmapModule;
import com.aimentor.entity.User;
import com.aimentor.entity.QuizAttempt;
import com.aimentor.repository.QuizAttemptRepository;
import com.aimentor.repository.RoadmapModuleRepository;
import com.aimentor.repository.RoadmapRepository;
import com.aimentor.repository.StudentSkillRepository;
import com.aimentor.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentDashboardService {

    private final UserRepository userRepository;
    private final RoadmapRepository roadmapRepository;
    private final RoadmapModuleRepository moduleRepository;
    private final QuizAttemptRepository attemptRepository;
    private final StudentSkillRepository studentSkillRepository;

    public StudentDashboardService(
            UserRepository userRepository,
            RoadmapRepository roadmapRepository,
            RoadmapModuleRepository moduleRepository,
            QuizAttemptRepository attemptRepository,
            StudentSkillRepository studentSkillRepository) {

        this.userRepository = userRepository;
        this.roadmapRepository = roadmapRepository;
        this.moduleRepository = moduleRepository;
        this.attemptRepository = attemptRepository;
        this.studentSkillRepository = studentSkillRepository;
    }

    public StudentDashboardResponse getDashboard(
            Long studentId) {

        User student = userRepository.findById(studentId)
                .orElseThrow(() ->
                        new RuntimeException("Student not found"));

        // =========================
        // ROADMAP PROGRESS
        // =========================

        List<Roadmap> roadmaps =
                roadmapRepository.findByStudentId(studentId);

        int totalModules = 0;
        int completedModules = 0;

        double roadmapProgress = 0.0;

        if (!roadmaps.isEmpty()) {

            Roadmap roadmap = roadmaps.get(0);

            List<RoadmapModule> modules =
                    moduleRepository
                            .findByRoadmapIdOrderByWeekNumberAsc(
                                    roadmap.getId()
                            );

            totalModules = modules.size();

            for (RoadmapModule module : modules) {

                if (module.getStatus()
                        == ModuleStatus.COMPLETED) {

                    completedModules++;
                }
            }

            if (totalModules > 0) {

                roadmapProgress =
                        ((double) completedModules
                                / totalModules) * 100;
            }
        }

        // =========================
        // QUIZ PERFORMANCE
        // =========================

        List<QuizAttempt> quizAttempts =
                attemptRepository.findByStudentId(studentId);

        int totalQuizAttempts = quizAttempts.size();

        int passedQuizzes = 0;

        for (QuizAttempt attempt : quizAttempts) {

            if (attempt.getPassed()) {
                passedQuizzes++;
            }
        }

        // Latest quiz attempt

        Integer latestQuizScore = null;
        Double latestQuizPercentage = null;
        Boolean latestQuizPassed = null;

        if (!quizAttempts.isEmpty()) {

            QuizAttempt latestAttempt =
                    quizAttempts.get(
                            quizAttempts.size() - 1
                    );

            latestQuizScore =
                    latestAttempt.getScore();

            latestQuizPercentage =
                    latestAttempt.getPercentage();

            latestQuizPassed =
                    latestAttempt.getPassed();
        }

        // =========================
        // STUDENT SKILLS
        // =========================

        int totalSkills =
                studentSkillRepository
                        .findByStudentId(studentId)
                        .size();

        // =========================
        // DASHBOARD RESPONSE
        // =========================

        return new StudentDashboardResponse(
                student.getId(),
                student.getName(),
                student.getEmail(),
                totalSkills,
                totalModules,
                completedModules,
                roadmapProgress,
                totalQuizAttempts,
                passedQuizzes,
                latestQuizScore,
                latestQuizPercentage,
                latestQuizPassed
        );
    }
}