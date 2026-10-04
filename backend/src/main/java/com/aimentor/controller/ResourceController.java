package com.aimentor.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aimentor.dto.ResourceResponse;
import com.aimentor.entity.Resource;
import com.aimentor.service.ResourceService;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(
        origins = {
                "http://localhost:5173",
                "https://ai-mentor-fawn.vercel.app"
        }
)
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    // =====================================================
    // 1. PERSONALIZED RESOURCES
    // =====================================================

    @GetMapping("/me")
    public ResponseEntity<List<ResourceResponse>> getMyResources(
            @RequestParam("studentId") Long studentId
    ) {

        System.out.println(
                "📚 GET personalized resources for student: "
                        + studentId
        );

        return ResponseEntity.ok(
                resourceService.getMyResources(studentId)
        );
    }

    // =====================================================
    // 2. ALL RESOURCES
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources() {

        System.out.println("📚 GET all resources");

        return ResponseEntity.ok(
                resourceService.getAllResources()
        );
    }

    // =====================================================
    // 2A. ALL RESOURCES - FRONTEND MASTER CATALOG
    // =====================================================

    @GetMapping("/all")
    public ResponseEntity<List<Resource>> getAllResourcesForFrontend() {

        System.out.println(
                "📚 GET all resources for frontend master catalog"
        );

        return ResponseEntity.ok(
                resourceService.getAllResources()
        );
    }

    // =====================================================
    // 3. RESOURCES BY SKILL
    // =====================================================

    @GetMapping("/skill/{skillId}")
    public ResponseEntity<List<Resource>> getResourcesBySkill(
            @PathVariable Long skillId
    ) {

        System.out.println(
                "🎯 GET resources for skill: " + skillId
        );

        return ResponseEntity.ok(
                resourceService.getResourcesBySkill(skillId)
        );
    }

    // =====================================================
    // 4. RESOURCES BY SKILL + TYPE
    // =====================================================

    @GetMapping("/skill/{skillId}/type/{type}")
    public ResponseEntity<List<Resource>> getResourcesBySkillAndType(
            @PathVariable Long skillId,
            @PathVariable String type
    ) {

        System.out.println(
                "🎬 GET resources | skill="
                        + skillId
                        + " | type="
                        + type
        );

        return ResponseEntity.ok(
                resourceService.getResourcesBySkillAndType(
                        skillId,
                        type
                )
        );
    }

    // =====================================================
    // 5. RESOURCES BY TYPE
    // =====================================================

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Resource>> getResourcesByType(
            @PathVariable String type
    ) {

        System.out.println(
                "📚 GET resources by type: " + type
        );

        return ResponseEntity.ok(
                resourceService.getResourcesByType(type)
        );
    }

    // =====================================================
    // 6. RESOURCES BY CATEGORY
    // =====================================================

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Resource>> getResourcesByCategory(
            @PathVariable String category
    ) {

        System.out.println(
                "📂 GET resources by category: " + category
        );

        return ResponseEntity.ok(
                resourceService.getResourcesByCategory(category)
        );
    }
}