package com.aimentor.controller;

import com.aimentor.dto.ContentProgressResponse;
import com.aimentor.service.ContentProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/content-progress")
public class ContentProgressController {

    private final ContentProgressService progressService;

    public ContentProgressController(
            ContentProgressService progressService) {

        this.progressService = progressService;
    }

    // Mark learning content as completed
    @PutMapping("/student/{studentId}/content/{contentId}/complete")
    public ResponseEntity<ContentProgressResponse> markCompleted(
            @PathVariable Long studentId,
            @PathVariable Long contentId) {

        return ResponseEntity.ok(
                progressService.markCompleted(
                        studentId,
                        contentId
                )
        );
    }

    // Get progress of a particular content
    @GetMapping("/student/{studentId}/content/{contentId}")
    public ResponseEntity<ContentProgressResponse> getContentProgress(
            @PathVariable Long studentId,
            @PathVariable Long contentId) {

        return ResponseEntity.ok(
                progressService.getContentProgress(
                        studentId,
                        contentId
                )
        );
    }

    // Get all content progress of a student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ContentProgressResponse>> getStudentProgress(
            @PathVariable Long studentId) {

        return ResponseEntity.ok(
                progressService.getStudentProgress(studentId)
        );
    }

    // Get completed content count
    @GetMapping("/student/{studentId}/completed-count")
    public ResponseEntity<Long> getCompletedContentCount(
            @PathVariable Long studentId) {

        return ResponseEntity.ok(
                progressService.getCompletedContentCount(
                        studentId
                )
        );
    }
}