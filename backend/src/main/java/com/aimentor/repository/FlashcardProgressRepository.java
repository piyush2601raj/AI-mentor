package com.aimentor.repository;

import com.aimentor.entity.FlashcardProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FlashcardProgressRepository extends JpaRepository<FlashcardProgress, Long> {

    List<FlashcardProgress> findByStudentId(Long studentId);

    Optional<FlashcardProgress> findByStudentIdAndFlashcardId(Long studentId, Long flashcardId);
}
