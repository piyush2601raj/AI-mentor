package com.aimentor.controller;

import com.aimentor.entity.Roadmap;
import com.aimentor.service.AIRoadmapService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai/roadmaps")
public class AIRoadmapController {

    private final AIRoadmapService aiRoadmapService;

    public AIRoadmapController(
            AIRoadmapService aiRoadmapService) {

        this.aiRoadmapService = aiRoadmapService;
    }

    // =====================================================
    // GENERATE PERSONALIZED AI ROADMAP
    // =====================================================

    @PostMapping("/generate")
    public ResponseEntity<?> generateRoadmap(

            @RequestParam(required = false)
            String focusSkill,

            @AuthenticationPrincipal Jwt jwt) {

        try {

            // =================================================
            // JWT CHECK
            // =================================================

            if (jwt == null) {

                return ResponseEntity
                        .status(401)
                        .body("Unauthorized");
            }

            // =================================================
            // GET USER ID
            // =================================================

            Number userIdClaim =
                    jwt.getClaim("userId");

            if (userIdClaim == null) {

                return ResponseEntity
                        .status(401)
                        .body(
                                "User ID not found in JWT"
                        );
            }

            Long studentId =
                    userIdClaim.longValue();

            // =================================================
            // VALIDATE FOCUS SKILL
            // =================================================

            if (focusSkill == null ||
                    focusSkill.trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Focus skill is required."
                        );
            }

            focusSkill =
                    focusSkill.trim();

            System.out.println(
                    "===================================="
            );

            System.out.println(
                    "GEMINI AI ROADMAP GENERATION"
            );

            System.out.println(
                    "Student ID: "
                            + studentId
            );

            System.out.println(
                    "Focus Skill: "
                            + focusSkill
            );

            System.out.println(
                    "===================================="
            );

            // =================================================
            // GENERATE ROADMAP
            // =================================================

            Roadmap roadmap =
                    aiRoadmapService.generateRoadmap(
                            studentId,
                            focusSkill
                    );

            // =================================================
            // RETURN
            // =================================================

            return ResponseEntity.ok(
                    roadmap
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(500)
                    .body(
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unable to generate AI roadmap."
                    );
        }
    }
}