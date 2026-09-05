package com.aimentor.repository;

import com.aimentor.entity.ModuleContent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ModuleContentRepository
        extends JpaRepository<ModuleContent, Long> {

    List<ModuleContent> findByModuleIdOrderByContentOrderAsc(
            Long moduleId
    );
}