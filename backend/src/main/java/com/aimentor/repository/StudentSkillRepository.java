package com.aimentor.repository;

import com.aimentor.entity.StudentSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudentSkillRepository extends JpaRepository<StudentSkill, Long> {

    // =====================================================
    // GET STUDENT SKILLS
    // Student + Skill ko ek saath fetch karega
    // =====================================================

    @Query("""
        SELECT ss
        FROM StudentSkill ss
        JOIN FETCH ss.skill
        WHERE ss.student.id = :studentId
    """)
    List<StudentSkill> findByStudentIdWithSkill(
            @Param("studentId") Long studentId
    );


    // =====================================================
    // NORMAL FIND
    // =====================================================

    List<StudentSkill> findByStudentId(Long studentId);


    // =====================================================
    // FIND SPECIFIC STUDENT + SKILL
    // =====================================================

    Optional<StudentSkill> findByStudentIdAndSkillId(
            Long studentId,
            Long skillId
    );


    // =====================================================
    // CHECK STUDENT SKILL
    // =====================================================

    boolean existsByStudentIdAndSkillId(
            Long studentId,
            Long skillId
    );


    // =====================================================
    // DELETE STUDENT SKILL
    // =====================================================

    void deleteByStudentIdAndSkillId(
            Long studentId,
            Long skillId
    );
}