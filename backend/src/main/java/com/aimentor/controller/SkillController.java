package com.aimentor.controller;

import com.aimentor.entity.Skill;
import com.aimentor.service.SkillService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    // =====================================================
    // GET ALL SKILLS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Skill>> getAllSkills() {

        return ResponseEntity.ok(
                skillService.getAllSkills()
        );
    }

    // =====================================================
    // GET ALL CATEGORIES
    // =====================================================

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {

        return ResponseEntity.ok(
                skillService.getAllCategories()
        );
    }

    // =====================================================
    // GET SKILLS BY CATEGORY
    // =====================================================

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Skill>> getSkillsByCategory(
            @PathVariable String category) {

        return ResponseEntity.ok(
                skillService.getSkillsByCategory(category)
        );
    }

    // =====================================================
    // GET SKILL BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<Skill> getSkillById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                skillService.getSkillById(id)
        );
    }

    // =====================================================
    // GET SKILL BY NAME
    // =====================================================

    @GetMapping("/name/{name}")
    public ResponseEntity<Skill> getSkillByName(
            @PathVariable String name) {

        return ResponseEntity.ok(
                skillService.getSkillByName(name)
        );
    }

    // =====================================================
    // CREATE SKILL
    // =====================================================

    @PostMapping
    public ResponseEntity<Skill> createSkill(
            @RequestBody Skill skill) {

        return ResponseEntity.ok(
                skillService.createSkill(skill)
        );
    }

    // =====================================================
    // UPDATE SKILL
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<Skill> updateSkill(
            @PathVariable Long id,
            @RequestBody Skill skill) {

        return ResponseEntity.ok(
                skillService.updateSkill(id, skill)
        );
    }

    // =====================================================
    // DELETE SKILL
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSkill(
            @PathVariable Long id) {

        skillService.deleteSkill(id);

        return ResponseEntity.noContent().build();
    }
}