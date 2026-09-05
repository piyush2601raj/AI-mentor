package com.aimentor.controller;

import com.aimentor.service.AIService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }


    // =========================================================
    // BASIC AI CHAT
    // =========================================================

    @GetMapping("/chat")
    public String chat(
            @RequestParam String message) {

        return aiService.chat(message);
    }


    // =========================================================
    // AI SKILL ANALYSIS
    // =========================================================

    @GetMapping("/analyze-skills/{studentId}")
    public String analyzeSkills(
            @PathVariable Long studentId) {

        return aiService.analyzeSkills(studentId);
    }
}