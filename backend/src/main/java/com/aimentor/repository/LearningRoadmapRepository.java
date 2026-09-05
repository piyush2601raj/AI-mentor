package com.aimentor.repository;

import com.aimentor.entity.LearningRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LearningRoadmapRepository
        extends JpaRepository<LearningRoadmap, Long> {

    Optional<LearningRoadmap> findByStudent_Id(Long studentId);
}