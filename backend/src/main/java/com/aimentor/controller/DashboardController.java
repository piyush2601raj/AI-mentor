package com.aimentor.controller;

import com.aimentor.dto.DashboardResponse;
import com.aimentor.service.DashboardService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(
            DashboardService dashboardService) {

        this.dashboardService = dashboardService;
    }

    @GetMapping("/{studentId}")
    public ResponseEntity<DashboardResponse> getDashboard(
            @PathVariable Long studentId) {

        DashboardResponse dashboard =
                dashboardService.getDashboard(studentId);

        return ResponseEntity.ok(dashboard);
    }
}