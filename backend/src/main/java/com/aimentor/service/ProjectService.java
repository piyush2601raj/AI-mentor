package com.aimentor.service;

import com.aimentor.dto.ProjectRequest;
import com.aimentor.dto.ProjectResponse;
import com.aimentor.entity.Project;
import com.aimentor.entity.ProjectPriority;
import com.aimentor.entity.ProjectStatus;
import com.aimentor.entity.User;
import com.aimentor.repository.ProjectRepository;
import com.aimentor.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public ProjectService(
            ProjectRepository projectRepository,
            UserRepository userRepository,
            JwtService jwtService) {

        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    // =====================================================
    // CURRENT LOGGED-IN STUDENT
    // =====================================================

    private User getCurrentStudent() {

        Long userId = jwtService.getCurrentUserId();

        if (userId == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "User is not logged in"
            );
        }

        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Student not found"
                        )
                );
    }

    // =====================================================
    // GET MY PROJECTS
    // =====================================================

    @Transactional(readOnly = true)
    public List<ProjectResponse> getMyProjects() {

        User student = getCurrentStudent();

        return projectRepository
                .findByStudentIdOrderByCreatedAtDesc(student.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =====================================================
    // GET SINGLE PROJECT
    // =====================================================

    @Transactional(readOnly = true)
    public ProjectResponse getMyProject(Long projectId) {

        User student = getCurrentStudent();

        Project project = projectRepository
                .findByIdAndStudentId(
                        projectId,
                        student.getId()
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Project not found"
                        )
                );

        return toResponse(project);
    }

    // =====================================================
    // CREATE PROJECT
    // =====================================================

    public ProjectResponse createProject(ProjectRequest request) {

        User student = getCurrentStudent();

        validateRequest(request);

        Project project = new Project();

        project.setStudent(student);
        project.setTitle(request.getTitle().trim());
        project.setDescription(request.getDescription());
        project.setCategory(request.getCategory().trim());

        project.setStatus(
                request.getStatus() != null
                        ? request.getStatus()
                        : ProjectStatus.PLANNED
        );

        project.setPriority(
                request.getPriority() != null
                        ? request.getPriority()
                        : ProjectPriority.MEDIUM
        );

        project.setProgress(
                request.getProgress() != null
                        ? clampProgress(request.getProgress())
                        : 0
        );

        project.setGithubUrl(request.getGithubUrl());
        project.setLiveUrl(request.getLiveUrl());
        project.setStartDate(request.getStartDate());
        project.setDeadline(request.getDeadline());

        Project saved = projectRepository.save(project);

        return toResponse(saved);
    }

    // =====================================================
    // UPDATE PROJECT
    // =====================================================

    public ProjectResponse updateProject(
            Long projectId,
            ProjectRequest request) {

        User student = getCurrentStudent();

        validateRequest(request);

        Project project = projectRepository
                .findByIdAndStudentId(
                        projectId,
                        student.getId()
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Project not found"
                        )
                );

        project.setTitle(request.getTitle().trim());
        project.setDescription(request.getDescription());
        project.setCategory(request.getCategory().trim());

        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }

        if (request.getPriority() != null) {
            project.setPriority(request.getPriority());
        }

        if (request.getProgress() != null) {
            project.setProgress(
                    clampProgress(request.getProgress())
            );
        }

        project.setGithubUrl(request.getGithubUrl());
        project.setLiveUrl(request.getLiveUrl());
        project.setStartDate(request.getStartDate());
        project.setDeadline(request.getDeadline());

        Project updated = projectRepository.save(project);

        return toResponse(updated);
    }

    // =====================================================
    // UPDATE PROGRESS ONLY
    // =====================================================

    public ProjectResponse updateProgress(
            Long projectId,
            Integer progress) {

        User student = getCurrentStudent();

        if (progress == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Progress is required"
            );
        }

        Project project = projectRepository
                .findByIdAndStudentId(
                        projectId,
                        student.getId()
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Project not found"
                        )
                );

        int safeProgress = clampProgress(progress);

        project.setProgress(safeProgress);

        // Automatically maintain status
        if (safeProgress == 100) {
            project.setStatus(ProjectStatus.COMPLETED);
        } else if (safeProgress > 0) {
            project.setStatus(ProjectStatus.IN_PROGRESS);
        } else {
            project.setStatus(ProjectStatus.PLANNED);
        }

        return toResponse(
                projectRepository.save(project)
        );
    }

    // =====================================================
    // DELETE PROJECT
    // =====================================================

    public void deleteProject(Long projectId) {

        User student = getCurrentStudent();

        Project project = projectRepository
                .findByIdAndStudentId(
                        projectId,
                        student.getId()
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Project not found"
                        )
                );

        projectRepository.delete(project);
    }

    // =====================================================
    // FILTER
    // =====================================================

    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjectsByStatus(
            ProjectStatus status) {

        User student = getCurrentStudent();

        return projectRepository
                .findByStudentIdAndStatusOrderByCreatedAtDesc(
                        student.getId(),
                        status
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =====================================================
    // SEARCH
    // =====================================================

    @Transactional(readOnly = true)
    public List<ProjectResponse> searchProjects(
            String query) {

        User student = getCurrentStudent();

        if (query == null || query.trim().isEmpty()) {
            return getMyProjects();
        }

        return projectRepository
                .findByStudentIdAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(
                        student.getId(),
                        query.trim()
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =====================================================
    // VALIDATION
    // =====================================================

    private void validateRequest(ProjectRequest request) {

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Project data is required"
            );
        }

        if (request.getTitle() == null ||
                request.getTitle().trim().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Project title is required"
            );
        }

        if (request.getCategory() == null ||
                request.getCategory().trim().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Project category is required"
            );
        }

        if (request.getDeadline() != null &&
                request.getStartDate() != null &&
                request.getDeadline()
                        .isBefore(request.getStartDate())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Deadline cannot be before start date"
            );
        }
    }

    // =====================================================
    // SAFE PROGRESS
    // =====================================================

    private int clampProgress(Integer progress) {

        return Math.max(
                0,
                Math.min(
                        100,
                        progress
                )
        );
    }

    // =====================================================
    // ENTITY → DTO
    // =====================================================

    private ProjectResponse toResponse(Project project) {

        return new ProjectResponse(

                project.getId(),

                project.getTitle(),

                project.getDescription(),

                project.getCategory(),

                project.getStatus() != null
                        ? project.getStatus().name()
                        : null,

                project.getPriority() != null
                        ? project.getPriority().name()
                        : null,

                project.getProgress(),

                project.getGithubUrl(),

                project.getLiveUrl(),

                project.getStartDate(),

                project.getDeadline(),

                project.getCreatedAt(),

                project.getUpdatedAt()
        );
    }
}