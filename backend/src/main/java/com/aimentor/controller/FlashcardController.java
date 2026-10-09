package com.aimentor.controller;

import com.aimentor.dto.FlashcardResponse;
import com.aimentor.dto.GenerateFlashcardsRequest;
import com.aimentor.dto.UpdateFlashcardProgressRequest;
import com.aimentor.service.FlashcardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/flashcards")
public class FlashcardController {

    private final FlashcardService flashcardService;

    public FlashcardController(FlashcardService flashcardService) {
        this.flashcardService = flashcardService;
    }

    @GetMapping("/topics")
    public ResponseEntity<List<String>> topics() {
        return ResponseEntity.ok(flashcardService.getTopics());
    }

    @GetMapping
    public ResponseEntity<List<FlashcardResponse>> cards(
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(flashcardService.getCards(topic, difficulty, search));
    }

    @GetMapping("/progress")
    public ResponseEntity<Map<Long, String>> progress() {
        return ResponseEntity.ok(flashcardService.getProgress());
    }

    @PostMapping("/generate")
    public ResponseEntity<List<FlashcardResponse>> generate(
            @RequestBody GenerateFlashcardsRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(flashcardService.generate(request));
    }

    @PostMapping("/{cardId}/progress")
    public ResponseEntity<Map<String, Object>> updateProgress(
            @PathVariable Long cardId,
            @RequestBody UpdateFlashcardProgressRequest request) {
        return ResponseEntity.ok(flashcardService.updateProgress(
                cardId, request == null ? null : request.getStatus()));
    }
}
