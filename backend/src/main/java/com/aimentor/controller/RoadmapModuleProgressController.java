package com.aimentor.controller;

import com.aimentor.dto.RoadmapModuleProgressResponse;
import com.aimentor.entity.ModuleStatus;
import com.aimentor.service.RoadmapModuleProgressService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/roadmap-modules")
public class RoadmapModuleProgressController {

    private final RoadmapModuleProgressService progressService;

    public RoadmapModuleProgressController(
            RoadmapModuleProgressService progressService) {

        this.progressService = progressService;
    }

    // =========================================
    // GET MODULE PROGRESS
    // =========================================

    @GetMapping("/{moduleId}/progress")
    public ResponseEntity<RoadmapModuleProgressResponse> getModuleProgress(

            @PathVariable Long moduleId,

            @AuthenticationPrincipal Jwt jwt) {

        Long studentId = getUserId(jwt);

        RoadmapModuleProgressResponse response =
                progressService.getModuleProgress(
                        moduleId,
                        studentId
                );

        return ResponseEntity.ok(response);
    }

    // =========================================
    // UPDATE MODULE STATUS
    // =========================================

    @PutMapping("/{moduleId}/progress")
    public ResponseEntity<RoadmapModuleProgressResponse> updateModuleProgress(

            @PathVariable Long moduleId,

            @RequestParam ModuleStatus status,

            @AuthenticationPrincipal Jwt jwt) {

        Long studentId = getUserId(jwt);

        if (status == null) {
            throw new IllegalArgumentException(
                    "Module status is required"
            );
        }

        RoadmapModuleProgressResponse response =
                progressService.updateStatus(
                        moduleId,
                        status,
                        studentId
                );

        return ResponseEntity.ok(response);
    }

    // =========================================
    // GET USER ID FROM JWT
    // =========================================

    private Long getUserId(Jwt jwt) {

        if (jwt == null) {
            throw new SecurityException(
                    "Authentication token is required"
            );
        }

        Number userId = jwt.getClaim("userId");

        if (userId == null) {
            throw new SecurityException(
                    "User ID not found in JWT"
            );
        }

        return userId.longValue();
    }
}