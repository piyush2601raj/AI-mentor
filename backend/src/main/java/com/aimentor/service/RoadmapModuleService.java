package com.aimentor.service;

import com.aimentor.entity.ModuleStatus;
import com.aimentor.entity.Roadmap;
import com.aimentor.entity.RoadmapModule;
import com.aimentor.entity.LearningContent;
import com.aimentor.exception.ResourceNotFoundException;
import com.aimentor.repository.RoadmapModuleRepository;
import com.aimentor.repository.RoadmapRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RoadmapModuleService {

    private final RoadmapModuleRepository moduleRepository;

    private final RoadmapRepository roadmapRepository;

    private final LearningContentGeneratorService
            learningContentGeneratorService;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public RoadmapModuleService(

            RoadmapModuleRepository moduleRepository,

            RoadmapRepository roadmapRepository,

            LearningContentGeneratorService
                    learningContentGeneratorService) {

        this.moduleRepository = moduleRepository;

        this.roadmapRepository = roadmapRepository;

        this.learningContentGeneratorService =
                learningContentGeneratorService;
    }


    // =====================================================
    // CREATE MODULE
    // =====================================================

    @Transactional
    public RoadmapModule createModule(

            Long roadmapId,

            String title,

            String description,

            Integer weekNumber) {


        Roadmap roadmap =
                roadmapRepository.findById(roadmapId)

                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Roadmap not found with id: "
                                                + roadmapId
                                )
                        );


        // =================================================
        // VALIDATE TITLE
        // =================================================

        if (title == null ||
                title.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Module title is required"
            );
        }


        // =================================================
        // VALIDATE DESCRIPTION
        // =================================================

        if (description == null ||
                description.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Module description is required"
            );
        }


        // =================================================
        // VALIDATE WEEK NUMBER
        // =================================================

        if (weekNumber == null ||
                weekNumber <= 0) {

            throw new IllegalArgumentException(
                    "Week number must be greater than 0"
            );
        }


        // =================================================
        // CREATE MODULE
        // =================================================

        RoadmapModule module =
                new RoadmapModule(

                        roadmap,

                        title.trim(),

                        description.trim(),

                        weekNumber
                );


        // =================================================
        // INITIAL STATUS
        // =================================================

        module.setStatus(
                ModuleStatus.NOT_STARTED
        );


        // =================================================
        // SAVE MODULE FIRST
        // =================================================

        RoadmapModule savedModule =
                moduleRepository.save(module);


        // =================================================
        // GENERATE LEARNING CONTENT
        // =================================================

        try {

            learningContentGeneratorService
                    .generateForModule(savedModule);

        } catch (Exception e) {

            /*
             * Module creation should not fail only because
             * learning content generation failed.
             *
             * The module is already saved.
             */

            System.err.println(
                    "Learning content generation failed "
                            + "for module "
                            + savedModule.getId()
            );

            e.printStackTrace();
        }


        // =================================================
        // RETURN MODULE
        // =================================================

        return savedModule;
    }


    // =====================================================
    // GET ALL MODULES
    // =====================================================

    public List<RoadmapModule> getModules(
            Long roadmapId) {

        roadmapRepository.findById(roadmapId)

                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Roadmap not found with id: "
                                        + roadmapId
                        )
                );


        return moduleRepository
                .findByRoadmapIdOrderByWeekNumberAsc(
                        roadmapId
                );
    }


    // =====================================================
    // GET ALL MODULES FOR STUDENT
    // =====================================================

    public List<RoadmapModule> getModulesForStudent(

            Long roadmapId,

            Long studentId) {


        Roadmap roadmap =
                roadmapRepository.findById(roadmapId)

                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Roadmap not found with id: "
                                                + roadmapId
                                )
                        );


        // =================================================
        // VERIFY OWNERSHIP
        // =================================================

        checkRoadmapOwnership(
                roadmap,
                studentId
        );


        return moduleRepository
                .findByRoadmapIdOrderByWeekNumberAsc(
                        roadmapId
                );
    }


    // =====================================================
    // GET MODULE
    // =====================================================

    public RoadmapModule getModule(
            Long moduleId) {

        return moduleRepository
                .findById(moduleId)

                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Roadmap module not found with id: "
                                        + moduleId
                        )
                );
    }


    // =====================================================
    // GET MODULE FOR STUDENT
    // =====================================================

    public RoadmapModule getModuleForStudent(

            Long moduleId,

            Long studentId) {


        RoadmapModule module =
                moduleRepository.findById(moduleId)

                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Roadmap module not found with id: "
                                                + moduleId
                                )
                        );


        // =================================================
        // CHECK ROADMAP
        // =================================================

        if (module.getRoadmap() == null ||
                module.getRoadmap().getStudent() == null) {

            throw new ResourceNotFoundException(
                    "Roadmap ownership information not found"
            );
        }


        Long ownerId =
                module.getRoadmap()
                        .getStudent()
                        .getId();


        // =================================================
        // CHECK OWNERSHIP
        // =================================================

        if (ownerId == null ||
                !ownerId.equals(studentId)) {

            throw new SecurityException(
                    "You are not authorized to access this module"
            );
        }


        return module;
    }


    // =====================================================
    // SAVE MODULE
    // =====================================================

    public RoadmapModule saveModule(
            RoadmapModule module) {

        if (module == null) {

            throw new IllegalArgumentException(
                    "Module cannot be null"
            );
        }


        return moduleRepository.save(module);
    }


    // =====================================================
    // START MODULE
    // =====================================================

    public RoadmapModule startModule(

            Long moduleId,

            Long studentId) {


        RoadmapModule module =
                getModuleForStudent(
                        moduleId,
                        studentId
                );


        // =================================================
        // ALREADY COMPLETED
        // =================================================

        if (module.getStatus() ==
                ModuleStatus.COMPLETED) {

            return module;
        }


        // =================================================
        // START
        // =================================================

        module.setStatus(
                ModuleStatus.IN_PROGRESS
        );


        return moduleRepository.save(module);
    }


    // =====================================================
    // COMPLETE MODULE
    // =====================================================

    public RoadmapModule completeModule(

            Long moduleId,

            Long studentId) {


        RoadmapModule module =
                getModuleForStudent(
                        moduleId,
                        studentId
                );


        // =================================================
        // ALREADY COMPLETED
        // =================================================

        if (module.getStatus() ==
                ModuleStatus.COMPLETED) {

            return module;
        }


        // =================================================
        // COMPLETE
        // =================================================

        module.setStatus(
                ModuleStatus.COMPLETED
        );


        return moduleRepository.save(module);
    }


    // =====================================================
    // UPDATE MODULE STATUS
    // =====================================================

    public RoadmapModule updateStatus(

            Long moduleId,

            Long studentId,

            ModuleStatus status) {


        if (status == null) {

            throw new IllegalArgumentException(
                    "Module status is required"
            );
        }


        RoadmapModule module =
                getModuleForStudent(
                        moduleId,
                        studentId
                );


        // =================================================
        // PREVENT COMPLETED → OTHER STATUS
        // =================================================

        if (module.getStatus() ==
                        ModuleStatus.COMPLETED
                &&
                status != ModuleStatus.COMPLETED) {

            return module;
        }


        // =================================================
        // UPDATE STATUS
        // =================================================

        module.setStatus(status);


        return moduleRepository.save(module);
    }


    // =====================================================
    // DELETE MODULE
    // =====================================================

    public void deleteModule(
            Long moduleId) {


        RoadmapModule module =
                moduleRepository.findById(moduleId)

                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Roadmap module not found with id: "
                                                + moduleId
                                )
                        );


        moduleRepository.delete(module);
    }


    // =====================================================
    // ROADMAP OWNERSHIP CHECK
    // =====================================================

    private void checkRoadmapOwnership(

            Roadmap roadmap,

            Long studentId) {


        if (roadmap.getStudent() == null ||

                roadmap.getStudent().getId() == null ||

                !roadmap.getStudent()
                        .getId()
                        .equals(studentId)) {

            throw new SecurityException(
                    "You are not authorized to access this roadmap"
            );
        }
    }
}