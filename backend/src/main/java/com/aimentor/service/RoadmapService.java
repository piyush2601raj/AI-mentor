package com.aimentor.service;

import com.aimentor.dto.RoadmapProgressResponse;
import com.aimentor.entity.Roadmap;
import com.aimentor.entity.RoadmapModule;
import com.aimentor.entity.User;
import com.aimentor.exception.ResourceNotFoundException;
import com.aimentor.repository.RoadmapModuleRepository;
import com.aimentor.repository.RoadmapRepository;
import com.aimentor.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RoadmapService {

    private final RoadmapRepository roadmapRepository;
    private final UserRepository userRepository;
    private final RoadmapModuleRepository roadmapModuleRepository;

    public RoadmapService(
            RoadmapRepository roadmapRepository,
            UserRepository userRepository,
            RoadmapModuleRepository roadmapModuleRepository) {

        this.roadmapRepository = roadmapRepository;
        this.userRepository = userRepository;
        this.roadmapModuleRepository = roadmapModuleRepository;
    }

    // =====================================================
    // CREATE ROADMAP
    // =====================================================

    public Roadmap createRoadmap(
            Long studentId,
            String title,
            String description,
            Integer durationWeeks) {

        User student = userRepository.findById(studentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student not found with id: " + studentId
                        ));

        Roadmap roadmap = new Roadmap(
                student,
                title,
                description,
                durationWeeks
        );

        return roadmapRepository.save(roadmap);
    }
 // =====================================================
 // GET ROADMAP MODULES
 // =====================================================

 @Transactional(readOnly = true)
 public List<RoadmapModule> getRoadmapModules(
         Long roadmapId,
         Long studentId) {

     // Check roadmap exists and belongs to student
     getRoadmapForStudent(
             roadmapId,
             studentId
     );

     return roadmapModuleRepository
             .findByRoadmapIdOrderByWeekNumberAsc(
                     roadmapId
             );
 }

    // =====================================================
    // SAVE AI GENERATED ROADMAP
    // =====================================================

    @Transactional
    public Roadmap saveGeneratedRoadmap(
            Long studentId,
            String title,
            String description,
            Integer durationWeeks,
            List<RoadmapModule> modules) {

        User student = userRepository.findById(studentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student not found with id: " + studentId
                        ));

        /*
         * -------------------------------------------------
         * IMPORTANT
         * -------------------------------------------------
         *
         * Existing roadmap for this student is removed
         * before saving the newly generated roadmap.
         *
         * This prevents the old Java Full Stack roadmap
         * from remaining visible.
         */

        List<Roadmap> existingRoadmaps =
                roadmapRepository.findByStudentId(studentId);

        if (existingRoadmaps != null &&
                !existingRoadmaps.isEmpty()) {

            roadmapRepository.deleteAll(existingRoadmaps);
        }

        // -------------------------------------------------
        // CREATE NEW ROADMAP
        // -------------------------------------------------

        Roadmap roadmap = new Roadmap(
                student,
                title,
                description,
                durationWeeks
        );

        roadmap = roadmapRepository.save(roadmap);

        // -------------------------------------------------
        // SAVE AI GENERATED MODULES
        // -------------------------------------------------

        if (modules != null && !modules.isEmpty()) {

            for (RoadmapModule module : modules) {

                module.setRoadmap(roadmap);
            }

            roadmapModuleRepository.saveAll(modules);
        }

        return roadmap;
    }

    // =====================================================
    // GET ROADMAP BY ID
    // =====================================================

    public Roadmap getRoadmap(Long roadmapId) {

        return roadmapRepository.findById(roadmapId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Roadmap not found with id: " + roadmapId
                        ));
    }

    // =====================================================
    // GET ROADMAP ONLY IF IT BELONGS TO STUDENT
    // =====================================================

    @Transactional(readOnly = true)
    public Roadmap getRoadmapForStudent(
            Long roadmapId,
            Long studentId) {

        Roadmap roadmap = roadmapRepository
                .findById(roadmapId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Roadmap not found with id: " + roadmapId
                        ));

        if (roadmap.getStudent() == null ||
                roadmap.getStudent().getId() == null ||
                !roadmap.getStudent().getId().equals(studentId)) {

            throw new SecurityException(
                    "You are not authorized to access this roadmap"
            );
        }

        return roadmap;
    }

    // =====================================================
    // GET ALL ROADMAPS OF STUDENT
    // =====================================================

    public List<Roadmap> getStudentRoadmaps(Long studentId) {

        userRepository.findById(studentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student not found with id: " + studentId
                        ));

        return roadmapRepository.findByStudentId(studentId);
    }

    // =====================================================
    // GET ALL ROADMAPS
    // =====================================================

    public List<Roadmap> getAllRoadmaps() {

        return roadmapRepository.findAll();
    }

    // =====================================================
    // GET ROADMAP PROGRESS
    // =====================================================

    public RoadmapProgressResponse getRoadmapProgress(
            Long roadmapId) {

        roadmapRepository.findById(roadmapId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Roadmap not found with id: " + roadmapId
                        ));

        List<RoadmapModule> modules =
                roadmapModuleRepository
                        .findByRoadmapIdOrderByWeekNumberAsc(
                                roadmapId
                        );

        int totalModules = modules.size();

        int completedModules = (int) modules.stream()
                .filter(module ->
                        module.getStatus() != null &&
                        "COMPLETED".equalsIgnoreCase(
                                module.getStatus().toString()
                        )
                )
                .count();

        int remainingModules =
                totalModules - completedModules;

        double progressPercentage =
                totalModules == 0
                        ? 0.0
                        : Math.round(
                                ((double) completedModules
                                        / totalModules) * 10000
                        ) / 100.0;

        return new RoadmapProgressResponse(
                roadmapId,
                totalModules,
                completedModules,
                remainingModules,
                progressPercentage
        );
    }

    // =====================================================
    // DELETE ROADMAP
    // =====================================================

    public void deleteRoadmap(Long roadmapId) {

        Roadmap roadmap =
                roadmapRepository.findById(roadmapId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Roadmap not found with id: "
                                                + roadmapId
                                ));

        roadmapRepository.delete(roadmap);
    }
}