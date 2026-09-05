package com.aimentor.service;

import com.aimentor.dto.RoadmapModuleProgressResponse;
import com.aimentor.entity.ModuleStatus;
import com.aimentor.entity.RoadmapModule;
import com.aimentor.exception.ResourceNotFoundException;
import com.aimentor.repository.RoadmapModuleRepository;

import org.springframework.stereotype.Service;

@Service
public class RoadmapModuleProgressService {

    private final RoadmapModuleRepository moduleRepository;

    public RoadmapModuleProgressService(
            RoadmapModuleRepository moduleRepository) {

        this.moduleRepository = moduleRepository;
    }

    // =========================================
    // GET MODULE PROGRESS
    // =========================================

    public RoadmapModuleProgressResponse getModuleProgress(
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

        // Ownership check
        checkOwnership(module, studentId);

        return toResponse(module);
    }

    // =========================================
    // UPDATE MODULE STATUS
    // =========================================

    public RoadmapModuleProgressResponse updateStatus(
            Long moduleId,
            ModuleStatus status,
            Long studentId) {

        if (status == null) {
            throw new IllegalArgumentException(
                    "Module status is required"
            );
        }

        RoadmapModule module =
                moduleRepository.findById(moduleId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Roadmap module not found with id: "
                                                + moduleId
                                )
                        );

        // Ownership check
        checkOwnership(module, studentId);

        module.setStatus(status);

        RoadmapModule savedModule =
                moduleRepository.save(module);

        return toResponse(savedModule);
    }

    // =========================================
    // CHECK MODULE OWNERSHIP
    // =========================================

    private void checkOwnership(
            RoadmapModule module,
            Long studentId) {

        if (module.getRoadmap() == null) {
            throw new ResourceNotFoundException(
                    "Roadmap not found for module"
            );
        }

        if (module.getRoadmap().getStudent() == null) {
            throw new ResourceNotFoundException(
                    "Student not found for roadmap"
            );
        }

        Long ownerId =
                module.getRoadmap()
                        .getStudent()
                        .getId();

        if (!ownerId.equals(studentId)) {
            throw new SecurityException(
                    "You are not authorized to access this module"
            );
        }
    }

    // =========================================
    // ENTITY -> DTO
    // =========================================

    private RoadmapModuleProgressResponse toResponse(
            RoadmapModule module) {

        return new RoadmapModuleProgressResponse(
                module.getId(),
                module.getTitle(),
                module.getStatus().name()
        );
    }
}