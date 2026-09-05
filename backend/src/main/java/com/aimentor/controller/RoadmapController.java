package com.aimentor.controller;

import com.aimentor.dto.RoadmapProgressResponse;
import com.aimentor.entity.Roadmap;
import com.aimentor.service.RoadmapService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roadmaps")
public class RoadmapController {

    private final RoadmapService roadmapService;

    public RoadmapController(RoadmapService roadmapService) {
        this.roadmapService = roadmapService;
    }

    // =====================================================
    // GET LOGGED-IN STUDENT ROADMAPS
    // =====================================================

    @GetMapping("/student")
    public ResponseEntity<List<Roadmap>> getStudentRoadmaps(
            @AuthenticationPrincipal Jwt jwt) {

        if (jwt == null) {
            return ResponseEntity
                    .status(401)
                    .build();
        }

        Number userIdClaim = jwt.getClaim("userId");

        if (userIdClaim == null) {
            return ResponseEntity
                    .status(401)
                    .build();
        }

        Long studentId = userIdClaim.longValue();

        List<Roadmap> roadmaps =
                roadmapService.getStudentRoadmaps(studentId);

        return ResponseEntity.ok(roadmaps);
    }

    // =====================================================
    // GET SINGLE ROADMAP
    // =====================================================

    @GetMapping("/{roadmapId}")
    public ResponseEntity<Roadmap> getRoadmap(
            @PathVariable Long roadmapId,
            @AuthenticationPrincipal Jwt jwt) {

        if (jwt == null) {
            return ResponseEntity
                    .status(401)
                    .build();
        }

        Number userIdClaim = jwt.getClaim("userId");

        if (userIdClaim == null) {
            return ResponseEntity
                    .status(401)
                    .build();
        }

        Long studentId = userIdClaim.longValue();

        Roadmap roadmap =
                roadmapService.getRoadmapForStudent(
                        roadmapId,
                        studentId
                );

        return ResponseEntity.ok(roadmap);
    }

    // =====================================================
    // GET ROADMAP PROGRESS
    // =====================================================

    @GetMapping("/{roadmapId}/progress")
    public ResponseEntity<RoadmapProgressResponse> getRoadmapProgress(
            @PathVariable Long roadmapId,
            @AuthenticationPrincipal Jwt jwt) {

        if (jwt == null) {
            return ResponseEntity
                    .status(401)
                    .build();
        }

        Number userIdClaim = jwt.getClaim("userId");

        if (userIdClaim == null) {
            return ResponseEntity
                    .status(401)
                    .build();
        }

        Long studentId = userIdClaim.longValue();

        // -------------------------------------------------
        // OWNERSHIP CHECK
        // -------------------------------------------------

        roadmapService.getRoadmapForStudent(
                roadmapId,
                studentId
        );

        // -------------------------------------------------
        // GET PROGRESS
        // -------------------------------------------------

        RoadmapProgressResponse progress =
                roadmapService.getRoadmapProgress(
                        roadmapId
                );

        return ResponseEntity.ok(progress);
    }
}