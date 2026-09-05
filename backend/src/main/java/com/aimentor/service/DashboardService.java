package com.aimentor.service;

import com.aimentor.dto.DashboardResponse;
import com.aimentor.dto.RoadmapProgressResponse;
import com.aimentor.entity.Roadmap;
import com.aimentor.entity.RoadmapModule;
import com.aimentor.entity.User;
import com.aimentor.exception.ResourceNotFoundException;
import com.aimentor.repository.RoadmapModuleRepository;
import com.aimentor.repository.RoadmapRepository;
import com.aimentor.repository.StudentSkillRepository;
import com.aimentor.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final RoadmapRepository roadmapRepository;
    private final RoadmapModuleRepository roadmapModuleRepository;
    private final RoadmapService roadmapService;

    public DashboardService(
            UserRepository userRepository,
            StudentSkillRepository studentSkillRepository,
            RoadmapRepository roadmapRepository,
            RoadmapModuleRepository roadmapModuleRepository,
            RoadmapService roadmapService) {

        this.userRepository = userRepository;
        this.studentSkillRepository = studentSkillRepository;
        this.roadmapRepository = roadmapRepository;
        this.roadmapModuleRepository = roadmapModuleRepository;
        this.roadmapService = roadmapService;
    }

    public DashboardResponse getDashboard(Long studentId) {

        // ==========================================
        // 1. Get Student
        // ==========================================

        User student = userRepository.findById(studentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student not found with id: " + studentId
                        )
                );

        DashboardResponse.StudentInfo studentInfo =
                new DashboardResponse.StudentInfo(
                        student.getId(),
                        student.getName(),
                        student.getEmail()
                );

        // ==========================================
        // 2. Get Skills Count
        // ==========================================

        int skillsCount =
                studentSkillRepository
                        .findByStudentId(studentId)
                        .size();

        // ==========================================
        // 3. Get Student Roadmaps
        // ==========================================

        List<Roadmap> roadmaps =
                roadmapRepository.findByStudentId(studentId);

        // No roadmap yet
        if (roadmaps.isEmpty()) {

            return new DashboardResponse(
                    studentInfo,
                    skillsCount,
                    null,
                    null
            );
        }

        // ==========================================
        // 4. Select Current Roadmap
        // ==========================================

        Roadmap roadmap = roadmaps.get(0);

        // ==========================================
        // 5. Get Roadmap Progress
        // ==========================================

        RoadmapProgressResponse progress =
                roadmapService.getRoadmapProgress(
                        roadmap.getId()
                );

        DashboardResponse.RoadmapInfo roadmapInfo =
                new DashboardResponse.RoadmapInfo(
                        progress.getRoadmapId(),
                        progress.getTotalModules(),
                        progress.getCompletedModules(),
                        progress.getRemainingModules(),
                        progress.getProgressPercentage()
                );

        // ==========================================
        // 6. Get Next Module
        // ==========================================

        List<RoadmapModule> modules =
                roadmapModuleRepository
                        .findByRoadmapIdOrderByWeekNumberAsc(
                                roadmap.getId()
                        );

        RoadmapModule nextModule = modules.stream()
                .filter(module ->
                        module.getStatus() != null
                                && !"COMPLETED".equalsIgnoreCase(
                                        module.getStatus().name()
                                )
                )
                .findFirst()
                .orElse(null);

        // ==========================================
        // 7. Convert Next Module to DTO
        // ==========================================

        DashboardResponse.NextModuleInfo nextModuleInfo = null;

        if (nextModule != null) {

            nextModuleInfo =
                    new DashboardResponse.NextModuleInfo(
                            nextModule.getId(),
                            nextModule.getTitle(),
                            nextModule.getDescription(),
                            nextModule.getWeekNumber()
                    );
        }

        // ==========================================
        // 8. Return Dashboard
        // ==========================================

        return new DashboardResponse(
                studentInfo,
                skillsCount,
                roadmapInfo,
                nextModuleInfo
        );
    }
}