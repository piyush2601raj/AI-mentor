package com.aimentor.controller;

import com.aimentor.entity.ModuleStatus;
import com.aimentor.entity.RoadmapModule;
import com.aimentor.service.RoadmapModuleService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roadmaps")
public class RoadmapModuleController {

    private final RoadmapModuleService moduleService;

    public RoadmapModuleController(
            RoadmapModuleService moduleService) {

        this.moduleService = moduleService;
    }

    // =====================================================
    // GET MODULES FOR LOGGED-IN STUDENT
    // GET /api/roadmaps/{roadmapId}/modules
    // =====================================================

    @GetMapping("/{roadmapId}/modules")
    public ResponseEntity<List<RoadmapModule>> getModules(
            @PathVariable Long roadmapId,
            @AuthenticationPrincipal Jwt jwt) {

        Long studentId = getUserId(jwt);

        return ResponseEntity.ok(
                moduleService.getModulesForStudent(
                        roadmapId,
                        studentId
                )
        );
    }

    // =====================================================
    // GET SINGLE MODULE
    // GET /api/roadmaps/modules/{moduleId}
    // =====================================================

    @GetMapping("/modules/{moduleId}")
    public ResponseEntity<RoadmapModule> getModule(
            @PathVariable Long moduleId,
            @AuthenticationPrincipal Jwt jwt) {

        Long studentId = getUserId(jwt);

        return ResponseEntity.ok(
                moduleService.getModuleForStudent(
                        moduleId,
                        studentId
                )
        );
    }

    // =====================================================
    // START MODULE
    // PUT /api/roadmaps/modules/{moduleId}/start
    // =====================================================

    @PutMapping("/modules/{moduleId}/start")
    public ResponseEntity<RoadmapModule> startModule(
            @PathVariable Long moduleId,
            @AuthenticationPrincipal Jwt jwt) {

        Long studentId = getUserId(jwt);

        return ResponseEntity.ok(
                moduleService.startModule(
                        moduleId,
                        studentId
                )
        );
    }

    // =====================================================
    // COMPLETE MODULE
    // PUT /api/roadmaps/modules/{moduleId}/complete
    // =====================================================

    @PutMapping("/modules/{moduleId}/complete")
    public ResponseEntity<RoadmapModule> completeModule(
            @PathVariable Long moduleId,
            @AuthenticationPrincipal Jwt jwt) {

        Long studentId = getUserId(jwt);

        return ResponseEntity.ok(
                moduleService.completeModule(
                        moduleId,
                        studentId
                )
        );
    }

    // =====================================================
    // UPDATE MODULE STATUS
    // PUT /api/roadmaps/modules/{moduleId}/status
    // =====================================================

    @PutMapping("/modules/{moduleId}/status")
    public ResponseEntity<RoadmapModule> updateStatus(
            @PathVariable Long moduleId,
            @RequestParam ModuleStatus status,
            @AuthenticationPrincipal Jwt jwt) {

        Long studentId = getUserId(jwt);

        return ResponseEntity.ok(
                moduleService.updateStatus(
                        moduleId,
                        studentId,
                        status
                )
        );
    }

    // =====================================================
    // GET USER ID FROM JWT
    // =====================================================

    private Long getUserId(Jwt jwt) {

        if (jwt == null) {
            throw new SecurityException(
                    "Authentication required"
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