package com.aimentor.service;

import com.aimentor.dto.ContentProgressResponse;
import com.aimentor.entity.ContentProgress;
import com.aimentor.entity.LearningContent;
import com.aimentor.entity.ModuleStatus;
import com.aimentor.entity.RoadmapModule;
import com.aimentor.entity.User;
import com.aimentor.exception.ResourceNotFoundException;
import com.aimentor.repository.ContentProgressRepository;
import com.aimentor.repository.LearningContentRepository;
import com.aimentor.repository.RoadmapModuleRepository;
import com.aimentor.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ContentProgressService {

    private final ContentProgressRepository progressRepository;
    private final LearningContentRepository contentRepository;
    private final RoadmapModuleRepository moduleRepository;
    private final UserRepository userRepository;

    public ContentProgressService(
            ContentProgressRepository progressRepository,
            LearningContentRepository contentRepository,
            RoadmapModuleRepository moduleRepository,
            UserRepository userRepository) {

        this.progressRepository = progressRepository;
        this.contentRepository = contentRepository;
        this.moduleRepository = moduleRepository;
        this.userRepository = userRepository;
    }

    // =====================================================
    // MARK LEARNING CONTENT AS COMPLETED
    // =====================================================

    @Transactional
    public ContentProgressResponse markCompleted(
            Long studentId,
            Long contentId) {

        User student = userRepository.findById(studentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student not found with id: " + studentId
                        )
                );

        LearningContent content = contentRepository.findById(contentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Content not found with id: " + contentId
                        )
                );

        // -------------------------------------------------
        // PREVENT DUPLICATE COMPLETION
        // -------------------------------------------------

        boolean alreadyCompleted =
                progressRepository
                        .existsByStudentIdAndContentId(
                                studentId,
                                contentId
                        );

        if (alreadyCompleted) {

            ContentProgress existingProgress =
                    progressRepository
                            .findByStudentIdAndContentId(
                                    studentId,
                                    contentId
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Content progress not found"
                                    )
                            );

            return new ContentProgressResponse(
                    existingProgress
            );
        }

        // -------------------------------------------------
        // CREATE CONTENT PROGRESS
        // -------------------------------------------------

        ContentProgress progress = new ContentProgress();

        progress.setStudent(student);
        progress.setContent(content);
        progress.setCompleted(true);

        ContentProgress savedProgress =
                progressRepository.save(progress);

        // -------------------------------------------------
        // CHECK MODULE PROGRESS
        // -------------------------------------------------

        Long moduleId =
                content.getModule().getId();

        long totalContents =
                contentRepository.countByModuleId(moduleId);

        long completedContents =
                progressRepository
                        .countByStudentIdAndContentModuleIdAndCompletedTrue(
                                studentId,
                                moduleId
                        );

        // -------------------------------------------------
        // ALL CONTENT COMPLETED
        // -------------------------------------------------

        if (totalContents > 0
                && completedContents >= totalContents) {

            RoadmapModule module =
                    moduleRepository.findById(moduleId)
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Module not found with id: "
                                                    + moduleId
                                    )
                            );

            module.setStatus(ModuleStatus.COMPLETED);

            moduleRepository.save(module);
        }

        return new ContentProgressResponse(
                savedProgress
        );
    }

    // =====================================================
    // GET PROGRESS OF PARTICULAR CONTENT
    // =====================================================

    public ContentProgressResponse getContentProgress(
            Long studentId,
            Long contentId) {

        ContentProgress progress =
                progressRepository
                        .findByStudentIdAndContentId(
                                studentId,
                                contentId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Content progress not found for student "
                                                + studentId
                                                + " and content "
                                                + contentId
                                )
                        );

        return new ContentProgressResponse(progress);
    }

    // =====================================================
    // GET ALL CONTENT PROGRESS OF STUDENT
    // =====================================================

    public List<ContentProgressResponse> getStudentProgress(
            Long studentId) {

        userRepository.findById(studentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student not found with id: " + studentId
                        )
                );

        return progressRepository
                .findByStudentId(studentId)
                .stream()
                .map(ContentProgressResponse::new)
                .toList();
    }

    // =====================================================
    // GET COMPLETED CONTENT COUNT
    // =====================================================

    public long getCompletedContentCount(
            Long studentId) {

        userRepository.findById(studentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student not found with id: " + studentId
                        )
                );

        return progressRepository
                .findByStudentId(studentId)
                .stream()
                .filter(progress ->
                        Boolean.TRUE.equals(
                                progress.getCompleted()
                        )
                )
                .count();
    }
}