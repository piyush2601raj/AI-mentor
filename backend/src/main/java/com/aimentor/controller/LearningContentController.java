package com.aimentor.controller;

import com.aimentor.dto.LearningContentResponse;
import com.aimentor.entity.LearningContent;
import com.aimentor.entity.RoadmapModule;
import com.aimentor.repository.RoadmapModuleRepository;
import com.aimentor.service.LearningContentGeneratorService;
import com.aimentor.service.LearningContentService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/learning-content")
public class LearningContentController {

    private final LearningContentService contentService;

    private final LearningContentGeneratorService generatorService;

    private final RoadmapModuleRepository roadmapModuleRepository;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public LearningContentController(
            LearningContentService contentService,
            LearningContentGeneratorService generatorService,
            RoadmapModuleRepository roadmapModuleRepository
    ) {

        this.contentService =
                contentService;

        this.generatorService =
                generatorService;

        this.roadmapModuleRepository =
                roadmapModuleRepository;
    }

    // =====================================================
    // GET MODULE CONTENT
    // =====================================================

    @GetMapping("/module/{moduleId}")
    public ResponseEntity<List<LearningContentResponse>>
    getModuleContent(
            @PathVariable Long moduleId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        Long studentId =
                getUserId(jwt);

        List<LearningContent> contents =
                contentService.getModuleContent(
                        moduleId,
                        studentId
                );

        List<LearningContentResponse> response =
                contents.stream()
                        .map(
                                LearningContentResponse::new
                        )
                        .toList();

        return ResponseEntity.ok(response);
    }

    // =====================================================
    // GET SINGLE CONTENT
    // =====================================================

    @GetMapping("/{contentId}")
    public ResponseEntity<LearningContentResponse>
    getContent(
            @PathVariable Long contentId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        Long studentId =
                getUserId(jwt);

        LearningContent content =
                contentService.getContent(
                        contentId,
                        studentId
                );

        return ResponseEntity.ok(
                new LearningContentResponse(content)
        );
    }

    // =====================================================
    // COMPLETE CONTENT
    // =====================================================

    @PutMapping("/{contentId}/complete")
    public ResponseEntity<LearningContentResponse>
    completeContent(
            @PathVariable Long contentId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        Long studentId =
                getUserId(jwt);

        LearningContent content =
                contentService.completeContent(
                        contentId,
                        studentId
                );

        return ResponseEntity.ok(
                new LearningContentResponse(content)
        );
    }

    // =====================================================
    // GENERATE MODULE CONTENT
    // =====================================================

    @PostMapping("/module/{moduleId}/generate")
    public ResponseEntity<List<LearningContentResponse>>
    generateContent(
            @PathVariable Long moduleId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        Long studentId =
                getUserId(jwt);

        /*
         * First verify that this module belongs
         * to the logged-in student.
         *
         * This keeps the existing ownership/security
         * validation intact.
         */
        contentService.getModuleContent(
                moduleId,
                studentId
        );

        /*
         * Now retrieve the actual RoadmapModule.
         */
        Optional<RoadmapModule> moduleOptional =
                roadmapModuleRepository.findById(
                        moduleId
                );

        if (moduleOptional.isEmpty()) {

            return ResponseEntity.notFound()
                    .build();
        }

        RoadmapModule module =
                moduleOptional.get();

        /*
         * Generate or repair learning content.
         */
        List<LearningContent> contents =
                generatorService.generateForModule(
                        module
                );

        List<LearningContentResponse> response =
                contents.stream()
                        .map(
                                LearningContentResponse::new
                        )
                        .toList();

        return ResponseEntity.ok(response);
    }

    // =====================================================
    // GET USER ID
    // =====================================================

    private Long getUserId(Jwt jwt) {

        if (jwt == null) {

            throw new SecurityException(
                    "Authentication required"
            );
        }

        Number userId =
                jwt.getClaim("userId");

        if (userId == null) {

            throw new SecurityException(
                    "User ID not found in JWT"
            );
        }

        return userId.longValue();
    }
}