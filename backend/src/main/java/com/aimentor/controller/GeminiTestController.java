package com.aimentor.controller;

import com.aimentor.service.GeminiService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/gemini")
public class GeminiTestController {

    private final GeminiService geminiService;

    public GeminiTestController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @GetMapping("/test")
    public Map<String, Object> testGemini() {

        String response = geminiService.generate(
                "Reply with exactly: Gemini integration is working."
        );

        return Map.of(
                "status", 200,
                "message", response
        );
    }
}