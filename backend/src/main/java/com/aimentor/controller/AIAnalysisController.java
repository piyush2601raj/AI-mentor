package com.aimentor.controller;

import com.aimentor.dto.AIAnalysisResponse;
import com.aimentor.service.AIAnalysisService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai-analysis")
public class AIAnalysisController {

    private final AIAnalysisService aiAnalysisService;

    public AIAnalysisController(
            AIAnalysisService aiAnalysisService) {

        this.aiAnalysisService = aiAnalysisService;
    }

    // =====================================================
    // GENERATE AI ANALYSIS
    // =====================================================

    @PostMapping("/generate")
    public ResponseEntity<AIAnalysisResponse> generateAnalysis(
            @AuthenticationPrincipal Jwt jwt) {

        // =================================================
        // JWT CHECK
        // =================================================

        if (jwt == null) {

            throw new RuntimeException(
                    "Authentication required"
            );
        }

        // =================================================
        // GET USER ID FROM JWT
        // =================================================

        Number userIdClaim =
                jwt.getClaim("userId");

        if (userIdClaim == null) {

            throw new RuntimeException(
                    "User ID not found in JWT"
            );
        }

        Long studentId =
                userIdClaim.longValue();

        // =================================================
        // DEBUG LOG
        // =================================================

        System.out.println(
                "===================================="
        );

        System.out.println(
                "AI ANALYSIS GENERATION"
        );

        System.out.println(
                "Student ID: " + studentId
        );

        System.out.println(
                "===================================="
        );

        // =================================================
        // GENERATE PERSONALIZED ANALYSIS
        // =================================================

        AIAnalysisResponse response =
                aiAnalysisService.generateAnalysis(
                        studentId
                );

        // =================================================
        // RETURN RESPONSE
        // =================================================

        return ResponseEntity.ok(response);
    }
}