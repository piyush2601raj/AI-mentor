package com.aimentor.controller;

import com.aimentor.dto.InterviewAttemptRequest;
import com.aimentor.dto.InterviewAttemptResponse;
import com.aimentor.dto.InterviewQuestionResponse;
import com.aimentor.dto.InterviewSummaryResponse;
import com.aimentor.service.InterviewPrepService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interview")
@CrossOrigin(origins = "http://localhost:5173")
public class InterviewPrepController {

    private final InterviewPrepService interviewPrepService;

    public InterviewPrepController(
            InterviewPrepService interviewPrepService
    ) {
        this.interviewPrepService = interviewPrepService;
    }

    // =========================================================
    // GET INTERVIEW QUESTIONS
    // =========================================================

    /*
     * Examples:
     *
     * /api/interview/questions
     *
     * /api/interview/questions?studentId=1
     *
     * /api/interview/questions?studentId=1&skill=Java
     *
     * /api/interview/questions?studentId=1&skill=Deep%20Learning
     *
     * /api/interview/questions?studentId=1&skill=Java&topic=OOP
     *
     * /api/interview/questions?studentId=1&skill=Java&difficulty=EASY
     *
     */

    @GetMapping("/questions")
    public ResponseEntity<List<InterviewQuestionResponse>> getQuestions(

            @RequestParam(required = false)
            String careerGoal,

            @RequestParam(required = false)
            String skill,

            @RequestParam(required = false)
            String topic,

            @RequestParam(required = false)
            String difficulty,

            @RequestParam(required = false)
            Long studentId

    ) {

        List<InterviewQuestionResponse> questions =
                interviewPrepService.questions(
                        careerGoal,
                        skill,
                        topic,
                        difficulty,
                        studentId
                );

        return ResponseEntity.ok(questions);
    }

    // =========================================================
    // GET INTERVIEW SUMMARY
    // =========================================================

    @GetMapping("/summary")
    public ResponseEntity<InterviewSummaryResponse> getSummary(

            @RequestParam(required = false)
            String careerGoal,

            @RequestParam(required = false)
            Long studentId

    ) {

        InterviewSummaryResponse summary =
                interviewPrepService.summary(
                        careerGoal,
                        studentId
                );

        return ResponseEntity.ok(summary);
    }

    // =========================================================
    // SUBMIT / ATTEMPT QUESTION
    // =========================================================

    @PostMapping("/attempt")
    public ResponseEntity<InterviewAttemptResponse> attemptQuestion(

            @RequestBody
            InterviewAttemptRequest request

    ) {

        InterviewAttemptResponse response =
                interviewPrepService.attempt(request);

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // HEALTH CHECK
    // =========================================================

    @GetMapping("/health")
    public ResponseEntity<String> health() {

        return ResponseEntity.ok(
                "Interview Prep API is running successfully"
        );
    }
}