package com.aimentor.repository;

import com.aimentor.entity.AIChatMessage;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AIChatMessageRepository
        extends JpaRepository<AIChatMessage, Long> {

    // =====================================================
    // GET CHAT HISTORY BY STUDENT ID
    // =====================================================

    @Query("""
            SELECT chat
            FROM AIChatMessage chat
            WHERE chat.student.id = :studentId
            ORDER BY chat.createdAt DESC
            """)
    List<AIChatMessage> findByStudentIdOrderByCreatedAtDesc(
            @Param("studentId") Long studentId
    );

}