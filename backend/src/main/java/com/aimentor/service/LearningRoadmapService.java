package com.aimentor.service;

import com.aimentor.dto.LearningRoadmapResponse;
import com.aimentor.entity.LearningRoadmap;
import com.aimentor.entity.User;
import com.aimentor.repository.LearningRoadmapRepository;
import com.aimentor.repository.UserRepository;

import org.springframework.stereotype.Service;

@Service
public class LearningRoadmapService {

    private final LearningRoadmapRepository roadmapRepository;
    private final UserRepository userRepository;

    public LearningRoadmapService(
            LearningRoadmapRepository roadmapRepository,
            UserRepository userRepository) {

        this.roadmapRepository = roadmapRepository;
        this.userRepository = userRepository;
    }

    public LearningRoadmapResponse createRoadmap(
            Long studentId,
            String title,
            String description,
            Integer durationWeeks) {

        User student = userRepository.findById(studentId)
                .orElseThrow(() ->
                        new RuntimeException("Student not found"));

        if (roadmapRepository.findByStudent_Id(studentId).isPresent()) {
            throw new RuntimeException(
                    "Roadmap already exists for this student");
        }

        LearningRoadmap roadmap = new LearningRoadmap();

        roadmap.setStudent(student);
        roadmap.setTitle(title);
        roadmap.setDescription(description);
        roadmap.setDurationWeeks(durationWeeks);

        LearningRoadmap saved = roadmapRepository.save(roadmap);

        return new LearningRoadmapResponse(
                saved.getId(),
                student.getId(),
                student.getName(),
                saved.getTitle(),
                saved.getDescription(),
                saved.getDurationWeeks()
        );
    }

    public LearningRoadmapResponse getRoadmap(Long studentId) {

        LearningRoadmap roadmap =
                roadmapRepository.findByStudent_Id(studentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Roadmap not found"));

        User student = roadmap.getStudent();

        return new LearningRoadmapResponse(
                roadmap.getId(),
                student.getId(),
                student.getName(),
                roadmap.getTitle(),
                roadmap.getDescription(),
                roadmap.getDurationWeeks()
        );
    }
}