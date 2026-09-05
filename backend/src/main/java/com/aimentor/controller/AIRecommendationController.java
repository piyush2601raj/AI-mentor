package com.aimentor.controller;

import com.aimentor.dto.AIRecommendationResponse;
import com.aimentor.service.AIRecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AIRecommendationController {

    private final AIRecommendationService recommendationService;

    public AIRecommendationController(
            AIRecommendationService recommendationService) {

        this.recommendationService = recommendationService;
    }

    @GetMapping("/recommendation/{studentId}")
    public ResponseEntity<AIRecommendationResponse> getRecommendation(
            @PathVariable Long studentId) {

        return ResponseEntity.ok(
                recommendationService
                        .generateRecommendation(studentId)
        );
    }
}