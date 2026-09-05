package com.aimentor.controller;

import com.aimentor.dto.StudentProfileRequest;
import com.aimentor.dto.StudentProfileResponse;
import com.aimentor.service.StudentProfileService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
public class StudentProfileController {

    private final StudentProfileService studentProfileService;

    public StudentProfileController(
            StudentProfileService studentProfileService) {

        this.studentProfileService = studentProfileService;
    }

    // =====================================================
    // GET MY PROFILE
    // =====================================================

    @GetMapping("/me/profile")
    public ResponseEntity<StudentProfileResponse> getMyProfile(
            @AuthenticationPrincipal Jwt jwt) {

        if (jwt == null) {
            return ResponseEntity.status(401).build();
        }

        Number userIdClaim = jwt.getClaim("userId");

        if (userIdClaim == null) {
            return ResponseEntity.status(401).build();
        }

        Long studentId = userIdClaim.longValue();

        return ResponseEntity.ok(
                studentProfileService.getProfile(studentId)
        );
    }

    // =====================================================
    // CREATE PROFILE
    // =====================================================

    @PostMapping("/{studentId}/profile")
    public ResponseEntity<StudentProfileResponse> createProfile(
            @PathVariable Long studentId,
            @RequestBody StudentProfileRequest request) {

        return ResponseEntity.ok(
                studentProfileService.createProfile(
                        studentId,
                        request
                )
        );
    }

    // =====================================================
    // GET PROFILE BY STUDENT ID
    // =====================================================

    @GetMapping("/{studentId}/profile")
    public ResponseEntity<StudentProfileResponse> getProfile(
            @PathVariable Long studentId) {

        return ResponseEntity.ok(
                studentProfileService.getProfile(studentId)
        );
    }

    // =====================================================
    // UPDATE PROFILE
    // =====================================================

    @PutMapping("/{studentId}/profile")
    public ResponseEntity<StudentProfileResponse> updateProfile(
            @PathVariable Long studentId,
            @RequestBody StudentProfileRequest request) {

        return ResponseEntity.ok(
                studentProfileService.updateProfile(
                        studentId,
                        request
                )
        );
    }
}