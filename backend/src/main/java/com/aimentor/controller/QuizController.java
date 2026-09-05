package com.aimentor.controller;

import com.aimentor.dto.QuizQuestionResponse;
import com.aimentor.dto.QuizResponse;
import com.aimentor.entity.Quiz;
import com.aimentor.entity.QuizQuestion;
import com.aimentor.service.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/modules")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    // Create Quiz
    @PostMapping("/{moduleId}/quizzes")
    public ResponseEntity<QuizResponse> createQuiz(
            @PathVariable Long moduleId,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam Integer totalQuestions) {

        Quiz quiz = quizService.createQuiz(
                moduleId,
                title,
                description,
                totalQuestions
        );

        return ResponseEntity.ok(
                new QuizResponse(quiz)
        );
    }

    // Get all quizzes of a module
    @GetMapping("/{moduleId}/quizzes")
    public ResponseEntity<List<QuizResponse>> getQuizzes(
            @PathVariable Long moduleId) {

        List<QuizResponse> response =
                quizService.getQuizzes(moduleId)
                        .stream()
                        .map(QuizResponse::new)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // Add Question
    @PostMapping("/quizzes/{quizId}/questions")
    public ResponseEntity<QuizQuestionResponse> addQuestion(
            @PathVariable Long quizId,
            @RequestParam String question,
            @RequestParam String optionA,
            @RequestParam String optionB,
            @RequestParam String optionC,
            @RequestParam String optionD,
            @RequestParam String correctAnswer) {

        QuizQuestion quizQuestion =
                quizService.addQuestion(
                        quizId,
                        question,
                        optionA,
                        optionB,
                        optionC,
                        optionD,
                        correctAnswer
                );

        return ResponseEntity.ok(
                new QuizQuestionResponse(quizQuestion)
        );
    }

    // Get all questions of a quiz
    @GetMapping("/quizzes/{quizId}/questions")
    public ResponseEntity<List<QuizQuestionResponse>> getQuestions(
            @PathVariable Long quizId) {

        List<QuizQuestionResponse> response =
                quizService.getQuestions(quizId)
                        .stream()
                        .map(QuizQuestionResponse::new)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}