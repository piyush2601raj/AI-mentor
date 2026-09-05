package com.aimentor.repository;

import com.aimentor.entity.RoadmapModule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoadmapModuleRepository
        extends JpaRepository<RoadmapModule, Long> {

    List<RoadmapModule> findByRoadmapIdOrderByWeekNumberAsc(Long roadmapId);
}