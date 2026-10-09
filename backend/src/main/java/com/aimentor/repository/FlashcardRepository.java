package com.aimentor.repository;

import com.aimentor.entity.Flashcard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {

    List<Flashcard> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    Optional<Flashcard> findByIdAndOwnerId(Long id, Long ownerId);

    @Query("select distinct f.topicName from Flashcard f where f.owner.id = :ownerId order by f.topicName")
    List<String> findDistinctTopicsByOwnerId(@Param("ownerId") Long ownerId);
}
