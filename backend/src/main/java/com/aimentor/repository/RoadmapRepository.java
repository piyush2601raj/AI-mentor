package com.aimentor.repository;

import com.aimentor.entity.Roadmap;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoadmapRepository extends JpaRepository<Roadmap, Long> {

    List<Roadmap> findByStudentId(Long studentId);

    Optional<Roadmap> findByIdAndStudentId(
            Long roadmapId,
            Long studentId
    );
}