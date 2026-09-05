package com.aimentor.service;

import com.aimentor.dto.LearningFlowResponse;
import com.aimentor.dto.RoadmapProgressResponse;
import com.aimentor.entity.ModuleStatus;
import com.aimentor.entity.Roadmap;
import com.aimentor.entity.RoadmapModule;
import com.aimentor.repository.RoadmapModuleRepository;
import com.aimentor.repository.RoadmapRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoadmapProgressService {

    private final RoadmapRepository roadmapRepository;
    private final RoadmapModuleRepository moduleRepository;

    public RoadmapProgressService(
            RoadmapRepository roadmapRepository,
            RoadmapModuleRepository moduleRepository) {

        this.roadmapRepository = roadmapRepository;
        this.moduleRepository = moduleRepository;
    }

    // Get roadmap progress
    public RoadmapProgressResponse getProgress(Long roadmapId) {

        Roadmap roadmap = roadmapRepository.findById(roadmapId)
                .orElseThrow(() ->
                        new RuntimeException("Roadmap not found"));

        List<RoadmapModule> modules =
                moduleRepository
                        .findByRoadmapIdOrderByWeekNumberAsc(
                                roadmapId
                        );

        int totalModules = modules.size();

        int completedModules = 0;

        for (RoadmapModule module : modules) {

            if (module.getStatus() == ModuleStatus.COMPLETED) {
                completedModules++;
            }
        }

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
                roadmap.getId(),
                totalModules,
                completedModules,
                remainingModules,
                progressPercentage
        );
    }

    // Get current and next learning module
    public LearningFlowResponse getLearningFlow(
            Long roadmapId) {

        // Check roadmap exists
        roadmapRepository.findById(roadmapId)
                .orElseThrow(() ->
                        new RuntimeException("Roadmap not found"));

        // Get modules ordered by week number
        List<RoadmapModule> modules =
                moduleRepository
                        .findByRoadmapIdOrderByWeekNumberAsc(
                                roadmapId
                        );

        LearningFlowResponse.ModuleResponse currentModule =
                null;

        LearningFlowResponse.ModuleResponse nextModule =
                null;

        /*
         * STEP 1:
         * Find IN_PROGRESS module.
         */
        for (RoadmapModule module : modules) {

            if (module.getStatus() == ModuleStatus.IN_PROGRESS) {

                currentModule =
                        new LearningFlowResponse.ModuleResponse(
                                module.getId(),
                                module.getTitle(),
                                module.getDescription(),
                                module.getWeekNumber(),
                                module.getStatus().name()
                        );

                break;
            }
        }

        /*
         * STEP 2:
         * If there is no IN_PROGRESS module,
         * first NOT_STARTED module becomes current.
         */
        if (currentModule == null) {

            for (RoadmapModule module : modules) {

                if (module.getStatus()
                        == ModuleStatus.NOT_STARTED) {

                    currentModule =
                            new LearningFlowResponse.ModuleResponse(
                                    module.getId(),
                                    module.getTitle(),
                                    module.getDescription(),
                                    module.getWeekNumber(),
                                    module.getStatus().name()
                            );

                    break;
                }
            }
        }

        /*
         * STEP 3:
         * Find the next NOT_STARTED module
         * after the current module.
         */
        boolean foundCurrentModule = false;

        for (RoadmapModule module : modules) {

            if (currentModule != null
                    && module.getId()
                    .equals(currentModule.getId())) {

                foundCurrentModule = true;
                continue;
            }

            if (foundCurrentModule
                    && module.getStatus()
                    == ModuleStatus.NOT_STARTED) {

                nextModule =
                        new LearningFlowResponse.ModuleResponse(
                                module.getId(),
                                module.getTitle(),
                                module.getDescription(),
                                module.getWeekNumber(),
                                module.getStatus().name()
                        );

                break;
            }
        }

        return new LearningFlowResponse(
                currentModule,
                nextModule
        );
    }
}