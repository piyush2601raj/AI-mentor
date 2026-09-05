package com.aimentor.service;

import com.aimentor.entity.ModuleContent;
import com.aimentor.entity.RoadmapModule;
import com.aimentor.exception.ResourceNotFoundException;
import com.aimentor.repository.ModuleContentRepository;
import com.aimentor.repository.RoadmapModuleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ModuleContentService {

    private final ModuleContentRepository contentRepository;
    private final RoadmapModuleRepository moduleRepository;

    public ModuleContentService(
            ModuleContentRepository contentRepository,
            RoadmapModuleRepository moduleRepository) {

        this.contentRepository = contentRepository;
        this.moduleRepository = moduleRepository;
    }

    public ModuleContent createContent(
            Long moduleId,
            String title,
            String content,
            String resourceUrl,
            Integer contentOrder) {

        RoadmapModule module = moduleRepository
                .findById(moduleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Module not found with id: " + moduleId
                        )
                );

        ModuleContent moduleContent = new ModuleContent(
                module,
                title,
                content,
                resourceUrl,
                contentOrder
        );

        return contentRepository.save(moduleContent);
    }

    public List<ModuleContent> getContents(Long moduleId) {

        if (!moduleRepository.existsById(moduleId)) {
            throw new ResourceNotFoundException(
                    "Module not found with id: " + moduleId
            );
        }

        return contentRepository
                .findByModuleIdOrderByContentOrderAsc(moduleId);
    }
}