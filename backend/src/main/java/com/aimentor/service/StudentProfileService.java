package com.aimentor.service;

import com.aimentor.dto.StudentProfileRequest;
import com.aimentor.dto.StudentProfileResponse;
import com.aimentor.entity.StudentProfile;
import com.aimentor.entity.User;
import com.aimentor.repository.StudentProfileRepository;
import com.aimentor.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class StudentProfileService {

    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;

    public StudentProfileService(
            StudentProfileRepository studentProfileRepository,
            UserRepository userRepository) {

        this.studentProfileRepository = studentProfileRepository;
        this.userRepository = userRepository;
    }

    // =====================================================
    // CREATE / SAVE PROFILE
    // =====================================================

    public StudentProfileResponse createProfile(
            Long studentId,
            StudentProfileRequest request) {

        User student = userRepository.findById(studentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Student not found with id: " + studentId
                        )
                );

        StudentProfile profile =
                studentProfileRepository
                        .findByStudentId(studentId)
                        .orElseGet(StudentProfile::new);

        profile.setStudent(student);

        profile.setCareerGoal(
                request.getCareerGoal()
        );

        profile.setExperienceLevel(
                request.getExperienceLevel()
        );

        if (request.getDailyStudyHours() != null) {
            profile.setLearningHoursPerDay(
                    request.getDailyStudyHours()
            );
        }

        if (profile.getCreatedAt() == null) {
            profile.setCreatedAt(
                    LocalDateTime.now()
            );
        }

        profile.setUpdatedAt(
                LocalDateTime.now()
        );

        StudentProfile savedProfile =
                studentProfileRepository.save(profile);

        return convertToResponse(savedProfile);
    }

    // =====================================================
    // GET PROFILE
    // =====================================================

    @Transactional(readOnly = true)
    public StudentProfileResponse getProfile(
            Long studentId) {

        StudentProfile profile =
                studentProfileRepository
                        .findByStudentId(studentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Student profile not found for student id: "
                                                + studentId
                                )
                        );

        return convertToResponse(profile);
    }

    // =====================================================
    // UPDATE PROFILE
    // =====================================================

    public StudentProfileResponse updateProfile(
            Long studentId,
            StudentProfileRequest request) {

        User student = userRepository.findById(studentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Student not found with id: " + studentId
                        )
                );

        StudentProfile profile =
                studentProfileRepository
                        .findByStudentId(studentId)
                        .orElseGet(StudentProfile::new);

        profile.setStudent(student);

        profile.setCareerGoal(
                request.getCareerGoal()
        );

        profile.setExperienceLevel(
                request.getExperienceLevel()
        );

        if (request.getDailyStudyHours() != null) {
            profile.setLearningHoursPerDay(
                    request.getDailyStudyHours()
            );
        }

        if (profile.getCreatedAt() == null) {
            profile.setCreatedAt(
                    LocalDateTime.now()
            );
        }

        profile.setUpdatedAt(
                LocalDateTime.now()
        );

        StudentProfile savedProfile =
                studentProfileRepository.save(profile);

        return convertToResponse(savedProfile);
    }

    // =====================================================
    // CONVERT ENTITY → RESPONSE
    // =====================================================

    private StudentProfileResponse convertToResponse(
            StudentProfile profile) {

        StudentProfileResponse response =
                new StudentProfileResponse();

        response.setId(
                profile.getId()
        );

        if (profile.getStudent() != null) {

            response.setStudentId(
                    profile.getStudent().getId()
            );

            response.setStudentName(
                    profile.getStudent().getName()
            );
        }

        if (profile.getCareerGoal() != null) {

            response.setCareerGoal(
                    profile.getCareerGoal().name()
            );

        } else {

            response.setCareerGoal(null);
        }

        response.setExperienceLevel(
                profile.getExperienceLevel()
        );

        response.setLearningHoursPerDay(
                profile.getLearningHoursPerDay()
        );

        return response;
    }
}