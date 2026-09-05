package com.aimentor.controller;

import com.aimentor.dto.AIStudyPlanResponse;
import com.aimentor.service.AIStudyPlanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AIStudyPlanController {

    private final AIStudyPlanService studyPlanService;

    public AIStudyPlanController(
            AIStudyPlanService studyPlanService) {

        this.studyPlanService = studyPlanService;
    }

    @GetMapping("/study-plan/{studentId}")
    public ResponseEntity<AIStudyPlanResponse> getStudyPlan(
            @PathVariable Long studentId) {

        return ResponseEntity.ok(
                studyPlanService.generateStudyPlan(studentId)
        );
    }
}