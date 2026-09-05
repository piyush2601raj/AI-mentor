package com.aimentor.controller;

import com.aimentor.dto.StudentSkillResponse;
import com.aimentor.entity.SkillLevel;
import com.aimentor.service.StudentSkillService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentSkillController {

    private final StudentSkillService studentSkillService;

    public StudentSkillController(
            StudentSkillService studentSkillService) {

        this.studentSkillService = studentSkillService;
    }

    // =====================================================
    // GET MY SKILLS
    // =====================================================

    @GetMapping("/me/skills")
    public ResponseEntity<List<StudentSkillResponse>> getMySkills() {

        return ResponseEntity.ok(
                studentSkillService.getCurrentStudentSkills()
        );
    }

    // =====================================================
    // ADD MY SKILL
    // =====================================================

    @PostMapping("/me/skills")
    public ResponseEntity<StudentSkillResponse> addMySkill(

            @RequestParam Long skillId,

            @RequestParam SkillLevel skillLevel) {

        return ResponseEntity.ok(
                studentSkillService.addCurrentStudentSkill(
                        skillId,
                        skillLevel
                )
        );
    }

    // =====================================================
    // GET ONE MY SKILL
    // =====================================================

    @GetMapping("/me/skills/{skillId}")
    public ResponseEntity<StudentSkillResponse> getMySkill(

            @PathVariable Long skillId) {

        return ResponseEntity.ok(
                studentSkillService.getCurrentStudentSkill(
                        skillId
                )
        );
    }

    // =====================================================
    // UPDATE MY SKILL
    // =====================================================

    @PutMapping("/me/skills/{skillId}")
    public ResponseEntity<StudentSkillResponse> updateMySkill(

            @PathVariable Long skillId,

            @RequestParam SkillLevel skillLevel) {

        return ResponseEntity.ok(
                studentSkillService.updateCurrentStudentSkill(
                        skillId,
                        skillLevel
                )
        );
    }

    // =====================================================
    // DELETE MY SKILL
    // =====================================================

    @DeleteMapping("/me/skills/{skillId}")
    public ResponseEntity<Void> deleteMySkill(

            @PathVariable Long skillId) {

        studentSkillService.removeCurrentStudentSkill(
                skillId
        );

        return ResponseEntity.noContent().build();
    }
}