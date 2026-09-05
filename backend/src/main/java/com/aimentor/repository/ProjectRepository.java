package com.aimentor.repository;

import com.aimentor.entity.Project;
import com.aimentor.entity.ProjectStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    Optional<Project> findByIdAndStudentId(
            Long id,
            Long studentId
    );

    List<Project> findByStudentIdAndStatusOrderByCreatedAtDesc(
            Long studentId,
            ProjectStatus status
    );

    List<Project> findByStudentIdAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(
            Long studentId,
            String title
    );

    long countByStudentId(Long studentId);

    long countByStudentIdAndStatus(
            Long studentId,
            ProjectStatus status
    );
}