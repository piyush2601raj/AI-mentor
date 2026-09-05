package com.aimentor.repository;

import com.aimentor.entity.Quiz;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, Long> {

    // Existing roadmap quizzes
    List<Quiz> findByModuleId(Long moduleId);

    // NEW: Get quizzes for a particular skill
    List<Quiz> findBySkillId(Long skillId);
}