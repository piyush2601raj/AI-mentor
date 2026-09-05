package com.aimentor.repository;

import com.aimentor.entity.LearningResource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LearningResourceRepository
        extends JpaRepository<LearningResource, Long> {

    List<LearningResource> findByModuleId(Long moduleId);
}