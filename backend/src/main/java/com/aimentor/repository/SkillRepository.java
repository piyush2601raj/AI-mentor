package com.aimentor.repository;

import com.aimentor.entity.Skill;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SkillRepository extends JpaRepository<Skill, Long> {

    Optional<Skill> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    List<Skill> findByCategoryIgnoreCase(String category);

    List<Skill> findByNameContainingIgnoreCase(String name);

    List<Skill> findByCategoryIgnoreCaseAndNameContainingIgnoreCase(
            String category,
            String name
    );

    // Get unique categories dynamically from database
    @Query("SELECT DISTINCT s.category FROM Skill s ORDER BY s.category")
    List<String> findDistinctCategories();
}