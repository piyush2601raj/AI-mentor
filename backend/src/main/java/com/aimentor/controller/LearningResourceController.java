package com.aimentor.controller;

import com.aimentor.entity.LearningResource;
import com.aimentor.entity.ResourceType;
import com.aimentor.service.LearningResourceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modules")
public class LearningResourceController {

    private final LearningResourceService resourceService;

    public LearningResourceController(
            LearningResourceService resourceService) {

        this.resourceService = resourceService;
    }

    @PostMapping("/{moduleId}/resources")
    public ResponseEntity<LearningResource> createResource(
            @PathVariable Long moduleId,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String url,
            @RequestParam ResourceType type) {

        return ResponseEntity.ok(
                resourceService.createResource(
                        moduleId,
                        title,
                        description,
                        url,
                        type
                )
        );
    }

    @GetMapping("/{moduleId}/resources")
    public ResponseEntity<List<LearningResource>> getResources(
            @PathVariable Long moduleId) {

        return ResponseEntity.ok(
                resourceService.getResources(moduleId)
        );
    }

    @PutMapping("/resources/{resourceId}/completion")
    public ResponseEntity<LearningResource> updateCompletion(
            @PathVariable Long resourceId,
            @RequestParam Boolean completed) {

        return ResponseEntity.ok(
                resourceService.updateCompletion(
                        resourceId,
                        completed
                )
        );
    }
}