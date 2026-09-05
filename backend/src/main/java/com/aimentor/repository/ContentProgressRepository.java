package com.aimentor.repository;

import com.aimentor.entity.ContentProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContentProgressRepository
        extends JpaRepository<ContentProgress, Long> {

    boolean existsByStudentIdAndContentId(
            Long studentId,
            Long contentId
    );

    Optional<ContentProgress> findByStudentIdAndContentId(
            Long studentId,
            Long contentId
    );

    List<ContentProgress> findByStudentId(
            Long studentId
    );

    long countByStudentIdAndContentModuleIdAndCompletedTrue(
            Long studentId,
            Long moduleId
    );
}