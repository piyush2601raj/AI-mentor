package com.aimentor.controller;

import com.aimentor.dto.ProjectRequest;
import com.aimentor.dto.ProjectResponse;
import com.aimentor.entity.ProjectStatus;
import com.aimentor.service.ProjectService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    // =====================================================
    // GET MY PROJECTS
    // =====================================================

    @GetMapping("/me")
    public ResponseEntity<List<ProjectResponse>> getMyProjects() {

        return ResponseEntity.ok(
                projectService.getMyProjects()
        );
    }

    // =====================================================
    // GET SINGLE PROJECT
    // =====================================================

    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> getProject(
            @PathVariable Long projectId) {

        return ResponseEntity.ok(
                projectService.getMyProject(projectId)
        );
    }

    // =====================================================
    // CREATE
    // =====================================================

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @RequestBody ProjectRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        projectService.createProject(request)
                );
    }

    // =====================================================
    // UPDATE
    // =====================================================

    @PutMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long projectId,
            @RequestBody ProjectRequest request) {

        return ResponseEntity.ok(
                projectService.updateProject(
                        projectId,
                        request
                )
        );
    }

    // =====================================================
    // UPDATE PROGRESS
    // =====================================================

    @PatchMapping("/{projectId}/progress")
    public ResponseEntity<ProjectResponse> updateProgress(
            @PathVariable Long projectId,
            @RequestParam Integer progress) {

        return ResponseEntity.ok(
                projectService.updateProgress(
                        projectId,
                        progress
                )
        );
    }

    // =====================================================
    // FILTER
    // =====================================================

    @GetMapping("/me/status/{status}")
    public ResponseEntity<List<ProjectResponse>> getByStatus(
            @PathVariable ProjectStatus status) {

        return ResponseEntity.ok(
                projectService.getProjectsByStatus(status)
        );
    }

    // =====================================================
    // SEARCH
    // =====================================================

    @GetMapping("/me/search")
    public ResponseEntity<List<ProjectResponse>> search(
            @RequestParam String q) {

        return ResponseEntity.ok(
                projectService.searchProjects(q)
        );
    }

    // =====================================================
    // DELETE
    // =====================================================

    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long projectId) {

        projectService.deleteProject(projectId);

        return ResponseEntity.noContent().build();
    }
}