package com.aimentor.controller;

import com.aimentor.dto.LearningRoadmapResponse;
import com.aimentor.service.LearningRoadmapService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
public class LearningRoadmapController {

    private final LearningRoadmapService roadmapService;

    public LearningRoadmapController(
            LearningRoadmapService roadmapService) {
        this.roadmapService = roadmapService;
    }

    @PostMapping("/{studentId}/roadmap")
    public ResponseEntity<LearningRoadmapResponse> createRoadmap(
            @PathVariable Long studentId,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam Integer durationWeeks) {

        LearningRoadmapResponse response =
                roadmapService.createRoadmap(
                        studentId,
                        title,
                        description,
                        durationWeeks
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{studentId}/roadmap")
    public ResponseEntity<LearningRoadmapResponse> getRoadmap(
            @PathVariable Long studentId) {

        return ResponseEntity.ok(
                roadmapService.getRoadmap(studentId)
        );
    }
}