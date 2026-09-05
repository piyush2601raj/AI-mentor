package com.aimentor.repository;

import com.aimentor.entity.Resource;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ResourceRepository
        extends JpaRepository<Resource, Long> {

    // =====================================================
    // PERSONALIZED RESOURCES
    // =====================================================

    @Query("""
        SELECT DISTINCT r
        FROM Resource r
        JOIN FETCH r.skill s
        WHERE s.id IN :skillIds
        ORDER BY r.id DESC
    """)
    List<Resource> findResourcesBySkillIds(
            @Param("skillIds") List<Long> skillIds
    );

    // =====================================================
    // RESOURCES BY SKILL
    // =====================================================

    List<Resource> findBySkillIdInOrderByIdDesc(
            List<Long> skillIds
    );

    // =====================================================
    // RESOURCES BY SKILL + TYPE
    // =====================================================

    List<Resource>
    findBySkillIdInAndTypeIgnoreCaseOrderByIdDesc(
            List<Long> skillIds,
            String type
    );

    // =====================================================
    // RESOURCES BY SKILL + CATEGORY
    // =====================================================

    List<Resource>
    findBySkillIdInAndCategoryIgnoreCaseOrderByIdDesc(
            List<Long> skillIds,
            String category
    );

    // =====================================================
    // RESOURCES BY TITLE
    // =====================================================

    List<Resource>
    findBySkillIdInAndTitleContainingIgnoreCaseOrderByIdDesc(
            List<Long> skillIds,
            String title
    );

    // =====================================================
    // ALL RESOURCES BY TYPE
    // =====================================================

    List<Resource>
    findByTypeIgnoreCaseOrderByIdDesc(
            String type
    );

    // =====================================================
    // ALL RESOURCES BY CATEGORY
    // =====================================================

    List<Resource>
    findByCategoryIgnoreCaseOrderByIdDesc(
            String category
    );
}