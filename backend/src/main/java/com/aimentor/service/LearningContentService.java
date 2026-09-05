package com.aimentor.service;

import com.aimentor.entity.LearningContent;
import com.aimentor.entity.LearningContentType;
import com.aimentor.entity.RoadmapModule;
import com.aimentor.exception.ResourceNotFoundException;
import com.aimentor.repository.LearningContentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LearningContentService {

    private final LearningContentRepository contentRepository;
    private final RoadmapModuleService moduleService;


    public LearningContentService(
            LearningContentRepository contentRepository,
            RoadmapModuleService moduleService) {

        this.contentRepository = contentRepository;
        this.moduleService = moduleService;
    }


    // =====================================================
    // CREATE CONTENT
    // =====================================================

    @Transactional
    public LearningContent createContent(
            Long moduleId,
            Long studentId,
            String title,
            LearningContentType contentType,
            String content,
            String resourceUrl,
            Integer contentOrder) {

        RoadmapModule module =
                moduleService.getModuleForStudent(
                        moduleId,
                        studentId
                );


        if (title == null ||
                title.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Content title is required"
            );
        }


        if (contentType == null) {

            throw new IllegalArgumentException(
                    "Content type is required"
            );
        }


        if (contentOrder == null ||
                contentOrder <= 0) {

            throw new IllegalArgumentException(
                    "Content order must be greater than 0"
            );
        }


        LearningContent learningContent =
                new LearningContent(
                        module,
                        title.trim(),
                        contentType,
                        content,
                        resourceUrl,
                        contentOrder
                );


        return contentRepository.save(
                learningContent
        );
    }


    // =====================================================
    // GET MODULE CONTENT
    // =====================================================

    @Transactional(readOnly = true)
    public List<LearningContent> getModuleContent(
            Long moduleId,
            Long studentId) {

        moduleService.getModuleForStudent(
                moduleId,
                studentId
        );


        return contentRepository
                .findByModuleIdOrderByContentOrderAsc(
                        moduleId
                );
    }


    // =====================================================
    // GET SINGLE CONTENT
    // =====================================================

    @Transactional(readOnly = true)
    public LearningContent getContent(
            Long contentId,
            Long studentId) {

        LearningContent content =
                contentRepository
                        .findById(contentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Learning content not found with id: "
                                                + contentId
                                )
                        );


        if (content.getModule() == null) {

            throw new ResourceNotFoundException(
                    "Module information not found"
            );
        }


        moduleService.getModuleForStudent(
                content.getModule().getId(),
                studentId
        );


        return content;
    }


    // =====================================================
    // MARK CONTENT COMPLETED
    // =====================================================

    @Transactional
    public LearningContent completeContent(
            Long contentId,
            Long studentId) {

        LearningContent content =
                getContent(
                        contentId,
                        studentId
                );


        content.setCompleted(true);


        return contentRepository.save(
                content
        );
    }


    // =====================================================
    // CHECK WHETHER MODULE HAS CONTENT
    // =====================================================

    @Transactional(readOnly = true)
    public boolean hasContent(Long moduleId) {

        return contentRepository
                .existsByModuleId(moduleId);
    }


    // =====================================================
    // COUNT MODULE CONTENT
    // =====================================================

    @Transactional(readOnly = true)
    public long getContentCount(
            Long moduleId) {

        return contentRepository
                .countByModuleId(moduleId);
    }
}