package com.aimentor.service;

import com.aimentor.entity.LearningResource;
import com.aimentor.entity.ResourceType;
import com.aimentor.entity.RoadmapModule;
import com.aimentor.repository.LearningResourceRepository;
import com.aimentor.repository.RoadmapModuleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LearningResourceService {

    private final LearningResourceRepository resourceRepository;
    private final RoadmapModuleRepository moduleRepository;

    public LearningResourceService(
            LearningResourceRepository resourceRepository,
            RoadmapModuleRepository moduleRepository) {

        this.resourceRepository = resourceRepository;
        this.moduleRepository = moduleRepository;
    }

    public LearningResource createResource(
            Long moduleId,
            String title,
            String description,
            String url,
            ResourceType type) {

        RoadmapModule module = moduleRepository.findById(moduleId)
                .orElseThrow(() ->
                        new RuntimeException("Module not found"));

        LearningResource resource = new LearningResource(
                module,
                title,
                description,
                url,
                type
        );

        return resourceRepository.save(resource);
    }

    public List<LearningResource> getResources(Long moduleId) {

        return resourceRepository.findByModuleId(moduleId);
    }

    public LearningResource updateCompletion(
            Long resourceId,
            Boolean completed) {

        LearningResource resource =
                resourceRepository.findById(resourceId)
                        .orElseThrow(() ->
                                new RuntimeException("Resource not found"));

        resource.setCompleted(completed);

        return resourceRepository.save(resource);
    }
}