package com.aimentor.controller;

import com.aimentor.dto.StudentDashboardResponse;
import com.aimentor.service.JwtService;
import com.aimentor.service.StudentDashboardService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/dashboard")
public class StudentDashboardController {

    private final StudentDashboardService dashboardService;
    private final JwtService jwtService;

    public StudentDashboardController(
            StudentDashboardService dashboardService,
            JwtService jwtService) {

        this.dashboardService = dashboardService;
        this.jwtService = jwtService;
    }

    // =====================================================
    // GET CURRENT LOGGED-IN STUDENT DASHBOARD
    // =====================================================

    @GetMapping("/me")
    public ResponseEntity<StudentDashboardResponse> getMyDashboard() {

        Long studentId = jwtService.getCurrentUserId();

        if (studentId == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "User is not logged in"
            );
        }

        return ResponseEntity.ok(
                dashboardService.getDashboard(studentId)
        );
    }

    // =====================================================
    // OPTIONAL ADMIN / INTERNAL ENDPOINT
    // =====================================================

    @GetMapping("/student/{studentId}")
    public ResponseEntity<StudentDashboardResponse> getDashboard(
            @PathVariable Long studentId) {

        return ResponseEntity.ok(
                dashboardService.getDashboard(studentId)
        );
    }
}