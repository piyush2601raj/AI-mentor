package com.aimentor.controller;

import com.aimentor.dto.AIChatHistoryResponse;
import com.aimentor.dto.AIChatRequest;
import com.aimentor.dto.AIChatResponse;
import com.aimentor.service.AIChatService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AIChatController {

    private final AIChatService chatService;

    public AIChatController(AIChatService chatService) {
        this.chatService = chatService;
    }

    // =====================================================
    // SEND MESSAGE TO AI
    // =====================================================

    @PostMapping("/chat")
    public ResponseEntity<AIChatResponse> chat(
            @RequestBody AIChatRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        if (jwt == null) {
            return ResponseEntity.status(401).build();
        }

        Number userIdClaim = jwt.getClaim("userId");

        if (userIdClaim == null) {
            return ResponseEntity.status(401).build();
        }

        // Get logged-in user's ID directly from JWT
        Long studentId = userIdClaim.longValue();

        // Set correct student ID
        request.setStudentId(studentId);

        return ResponseEntity.ok(
                chatService.chat(request)
        );
    }

    // =====================================================
    // GET CHAT HISTORY
    // =====================================================

    @GetMapping("/chat/history/{studentId}")
    public ResponseEntity<List<AIChatHistoryResponse>> getChatHistory(
            @PathVariable Long studentId) {

        return ResponseEntity.ok(
                chatService.getChatHistory(studentId)
        );
    }
}