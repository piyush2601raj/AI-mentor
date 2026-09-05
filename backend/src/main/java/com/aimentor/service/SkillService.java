package com.aimentor.service;

import com.aimentor.entity.Skill;
import com.aimentor.repository.SkillRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SkillService {

    private final SkillRepository skillRepository;

    public SkillService(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    // =====================================================
    // CREATE SKILL
    // =====================================================

    public Skill createSkill(Skill skill) {

        if (skillRepository.existsByNameIgnoreCase(skill.getName())) {

            throw new RuntimeException(
                    "Skill already exists: " + skill.getName()
            );
        }

        return skillRepository.save(skill);
    }

    // =====================================================
    // GET SKILLS BY CATEGORY
    // =====================================================

    public List<Skill> getSkillsByCategory(String category) {

        return skillRepository.findByCategoryIgnoreCase(category);
    }

    // =====================================================
    // GET ALL SKILLS
    // =====================================================

    public List<Skill> getAllSkills() {

        return skillRepository.findAll();
    }

    // =====================================================
    // GET ALL CATEGORIES
    // =====================================================

    public List<String> getAllCategories() {

        return skillRepository.findDistinctCategories();
    }

    // =====================================================
    // GET SKILL BY ID
    // =====================================================

    public Skill getSkillById(Long id) {

        return skillRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Skill not found with id: " + id
                        )
                );
    }

    // =====================================================
    // GET SKILL BY NAME
    // =====================================================

    public Skill getSkillByName(String name) {

        return skillRepository.findByNameIgnoreCase(name)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Skill not found: " + name
                        )
                );
    }

    // =====================================================
    // UPDATE SKILL
    // =====================================================

    public Skill updateSkill(
            Long id,
            Skill updatedSkill) {

        Skill existingSkill = getSkillById(id);

        existingSkill.setName(
                updatedSkill.getName()
        );

        existingSkill.setCategory(
                updatedSkill.getCategory()
        );

        existingSkill.setDescription(
                updatedSkill.getDescription()
        );

        return skillRepository.save(existingSkill);
    }

    // =====================================================
    // DELETE SKILL
    // =====================================================

    public void deleteSkill(Long id) {

        Skill skill = getSkillById(id);

        skillRepository.delete(skill);
    }
}