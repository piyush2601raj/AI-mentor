package com.aimentor.repository;

import com.aimentor.entity.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewQuestionRepository
        extends JpaRepository<InterviewQuestion, Long> {

    List<InterviewQuestion>
    findByCareerGoalIgnoreCaseOrderByIdAsc(String careerGoal);

    List<InterviewQuestion>
    findByCareerGoalIgnoreCaseAndTopicIgnoreCaseOrderByIdAsc(
            String careerGoal,
            String topic
    );

    List<InterviewQuestion>
    findByCareerGoalIgnoreCaseAndDifficultyIgnoreCaseOrderByIdAsc(
            String careerGoal,
            String difficulty
    );

    List<InterviewQuestion>
    findBySkillIgnoreCaseOrderByIdAsc(String skill);

    List<InterviewQuestion>
    findBySkillIgnoreCaseAndTopicIgnoreCaseOrderByIdAsc(
            String skill,
            String topic
    );

    List<InterviewQuestion>
    findBySkillIgnoreCaseAndDifficultyIgnoreCaseOrderByIdAsc(
            String skill,
            String difficulty
    );

    long countBySkillIgnoreCase(String skill);

    boolean existsByCareerGoalAndQuestion(
            String careerGoal,
            String question
    );
}