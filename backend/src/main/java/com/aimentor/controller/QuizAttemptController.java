package com.aimentor.controller;

import com.aimentor.dto.QuizAttemptResponse;
import com.aimentor.entity.QuizAttempt;
import com.aimentor.service.QuizAttemptService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quizzes")
public class QuizAttemptController {

    private final QuizAttemptService attemptService;

    public QuizAttemptController(
            QuizAttemptService attemptService) {

        this.attemptService = attemptService;
    }

    @PostMapping("/{quizId}/attempt")
    public ResponseEntity<QuizAttemptResponse> submitQuiz(
            @PathVariable Long quizId,
            @RequestParam Long studentId,
            @RequestBody List<String> answers) {

        QuizAttempt attempt = attemptService.submitQuiz(
                quizId,
                studentId,
                answers
        );

        return ResponseEntity.ok(
                new QuizAttemptResponse(attempt)
        );
    }

    @GetMapping("/student/{studentId}/attempts")
    public ResponseEntity<List<QuizAttemptResponse>> getStudentAttempts(
            @PathVariable Long studentId) {

        List<QuizAttemptResponse> response =
                attemptService.getStudentAttempts(studentId)
                        .stream()
                        .map(QuizAttemptResponse::new)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{quizId}/attempts")
    public ResponseEntity<List<QuizAttemptResponse>> getQuizAttempts(
            @PathVariable Long quizId) {

        List<QuizAttemptResponse> response =
                attemptService.getQuizAttempts(quizId)
                        .stream()
                        .map(QuizAttemptResponse::new)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}