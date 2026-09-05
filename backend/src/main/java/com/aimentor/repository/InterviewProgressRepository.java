package com.aimentor.repository;

import com.aimentor.entity.InterviewProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InterviewProgressRepository extends JpaRepository<InterviewProgress, Long> {
    Optional<InterviewProgress> findByStudentIdAndQuestionId(Long studentId, Long questionId);
    List<InterviewProgress> findByStudentId(Long studentId);
}
