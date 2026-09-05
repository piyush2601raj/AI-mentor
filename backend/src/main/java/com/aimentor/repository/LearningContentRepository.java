package com.aimentor.repository;

import com.aimentor.entity.LearningContent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LearningContentRepository
        extends JpaRepository<LearningContent, Long> {

    // =====================================================
    // GET MODULE CONTENT
    // =====================================================

    List<LearningContent> findByModuleIdOrderByContentOrderAsc(
            Long moduleId
    );

    // =====================================================
    // COUNT MODULE CONTENT
    // =====================================================

    long countByModuleId(Long moduleId);

    // =====================================================
    // CHECK CONTENT EXISTS
    // =====================================================

    boolean existsByModuleId(Long moduleId);

    // =====================================================
    // DELETE MODULE CONTENT
    // =====================================================

    void deleteByModuleId(Long moduleId);
}