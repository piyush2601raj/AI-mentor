package com.aimentor.service;

import com.aimentor.dto.StudentSkillResponse;
import com.aimentor.entity.Skill;
import com.aimentor.entity.SkillLevel;
import com.aimentor.entity.StudentSkill;
import com.aimentor.entity.User;
import com.aimentor.repository.SkillRepository;
import com.aimentor.repository.StudentSkillRepository;
import com.aimentor.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class StudentSkillService {

    private final StudentSkillRepository studentSkillRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final JwtService jwtService;

    public StudentSkillService(
            StudentSkillRepository studentSkillRepository,
            UserRepository userRepository,
            SkillRepository skillRepository,
            JwtService jwtService) {

        this.studentSkillRepository = studentSkillRepository;
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.jwtService = jwtService;
    }

    // =====================================================
    // GET CURRENT LOGGED-IN STUDENT
    // =====================================================

    private User getCurrentStudent() {

        Long currentUserId = jwtService.getCurrentUserId();

        if (currentUserId == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "User is not logged in"
            );
        }

        return userRepository.findById(currentUserId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Student not found"
                        )
                );
    }

    // =====================================================
    // GET MY SELECTED SKILLS
    // =====================================================

    @Transactional(readOnly = true)
    public List<StudentSkillResponse> getCurrentStudentSkills() {

        User student = getCurrentStudent();

        return studentSkillRepository
                .findByStudentId(student.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =====================================================
    // ADD SKILL
    // =====================================================

    public StudentSkillResponse addCurrentStudentSkill(
            Long skillId,
            SkillLevel skillLevel) {

        User student = getCurrentStudent();

        // Validate skill ID
        if (skillId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Skill ID is required"
            );
        }

        // Default proficiency
        if (skillLevel == null) {
            skillLevel = SkillLevel.BEGINNER;
        }

        // Find skill
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Skill not found with id: " + skillId
                        )
                );

        // Prevent duplicate skill
        boolean alreadyExists =
                studentSkillRepository
                        .existsByStudentIdAndSkillId(
                                student.getId(),
                                skillId
                        );

        if (alreadyExists) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Student already has this skill"
            );
        }

        // Create student skill
        StudentSkill studentSkill =
                new StudentSkill(
                        student,
                        skill,
                        skillLevel
                );

        StudentSkill savedSkill =
                studentSkillRepository.save(studentSkill);

        return toResponse(savedSkill);
    }

    // =====================================================
    // GET ONE MY SKILL
    // =====================================================

    @Transactional(readOnly = true)
    public StudentSkillResponse getCurrentStudentSkill(
            Long skillId) {

        User student = getCurrentStudent();

        StudentSkill studentSkill =
                studentSkillRepository
                        .findByStudentIdAndSkillId(
                                student.getId(),
                                skillId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Student skill not found"
                                )
                        );

        return toResponse(studentSkill);
    }

    // =====================================================
    // UPDATE PROFICIENCY
    // =====================================================

    public StudentSkillResponse updateCurrentStudentSkill(
            Long skillId,
            SkillLevel skillLevel) {

        User student = getCurrentStudent();

        // Validate proficiency
        if (skillLevel == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Skill level is required"
            );
        }

        StudentSkill studentSkill =
                studentSkillRepository
                        .findByStudentIdAndSkillId(
                                student.getId(),
                                skillId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Student skill not found"
                                )
                        );

        studentSkill.setSkillLevel(skillLevel);

        StudentSkill updatedSkill =
                studentSkillRepository.save(studentSkill);

        return toResponse(updatedSkill);
    }

    // =====================================================
    // REMOVE MY SKILL
    // =====================================================

    public void removeCurrentStudentSkill(
            Long skillId) {

        User student = getCurrentStudent();

        StudentSkill studentSkill =
                studentSkillRepository
                        .findByStudentIdAndSkillId(
                                student.getId(),
                                skillId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Student skill not found"
                                )
                        );

        studentSkillRepository.delete(studentSkill);
    }

    // =====================================================
    // ENTITY → RESPONSE DTO
    // =====================================================

    private StudentSkillResponse toResponse(
            StudentSkill studentSkill) {

        return new StudentSkillResponse(
                studentSkill.getId(),

                studentSkill.getStudent().getId(),

                studentSkill.getStudent().getName(),

                studentSkill.getSkill().getId(),

                studentSkill.getSkill().getName(),

                studentSkill.getSkill().getCategory(),

                studentSkill.getSkillLevel().name()
        );
    }
}