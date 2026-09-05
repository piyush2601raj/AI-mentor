package com.aimentor.controller;

import com.aimentor.dto.LoginRequest;
import com.aimentor.dto.RegisterRequest;
import com.aimentor.entity.User;
import com.aimentor.service.AuthService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // =========================
    // REGISTER STUDENT
    // =========================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {

        User user = authService.registerStudent(
                request.getName(),
                request.getEmail(),
                request.getPassword()
        );

        return ResponseEntity.ok(
                Map.of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "role", user.getRole()
                )
        );
    }

    // =========================
    // LOGIN
    // =========================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        User user = authService.login(
                request.getEmail(),
                request.getPassword()
        );

        // Generate JWT token
        String token = authService.generateToken(user);

        return ResponseEntity.ok(
                Map.of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "role", user.getRole(),
                        "token", token
                )
        );
    }

    // =========================
    // RESET PASSWORD
    // =========================
    // Development / testing purpose

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestParam String email,
            @RequestParam String newPassword) {

        User user = authService.resetPassword(
                email,
                newPassword
        );

        return ResponseEntity.ok(
                Map.of(
                        "message", "Password reset successfully",
                        "email", user.getEmail()
                )
        );
    }
}