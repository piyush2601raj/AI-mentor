package com.aimentor.service;

import com.aimentor.entity.Quiz;
import com.aimentor.entity.QuizQuestion;
import com.aimentor.entity.RoadmapModule;
import com.aimentor.entity.Skill;

import com.aimentor.repository.QuizQuestionRepository;
import com.aimentor.repository.QuizRepository;
import com.aimentor.repository.RoadmapModuleRepository;
import com.aimentor.repository.SkillRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final RoadmapModuleRepository moduleRepository;
    private final SkillRepository skillRepository;

    public QuizService(
            QuizRepository quizRepository,
            QuizQuestionRepository questionRepository,
            RoadmapModuleRepository moduleRepository,
            SkillRepository skillRepository) {

        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.moduleRepository = moduleRepository;
        this.skillRepository = skillRepository;
    }

    // =========================================================
    // EXISTING: CREATE ROADMAP QUIZ
    // =========================================================

    public Quiz createQuiz(
            Long moduleId,
            String title,
            String description,
            Integer totalQuestions) {

        RoadmapModule module =
                moduleRepository.findById(moduleId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Module not found"
                                ));

        Quiz quiz = new Quiz();

        quiz.setModule(module);
        quiz.setTitle(title);
        quiz.setDescription(description);
        quiz.setTotalQuestions(totalQuestions);

        return quizRepository.save(quiz);
    }

    // =========================================================
    // EXISTING: GET QUIZZES BY MODULE
    // =========================================================

    public List<Quiz> getQuizzes(Long moduleId) {

        return quizRepository.findByModuleId(moduleId);
    }

    // =========================================================
    // NEW: CREATE SKILL ASSESSMENT QUIZ
    // =========================================================

    public Quiz createSkillQuiz(
            Long moduleId,
            Long skillId,
            String title,
            String description,
            Integer totalQuestions) {

        RoadmapModule module =
                moduleRepository.findById(moduleId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Module not found"
                                ));

        Skill skill =
                skillRepository.findById(skillId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Skill not found"
                                ));

        Quiz quiz = new Quiz();

        quiz.setModule(module);
        quiz.setSkill(skill);
        quiz.setTitle(title);
        quiz.setDescription(description);
        quiz.setTotalQuestions(totalQuestions);

        return quizRepository.save(quiz);
    }

    // =========================================================
    // NEW: GET QUIZZES BY SKILL
    // =========================================================

    public List<Quiz> getQuizzesBySkill(Long skillId) {

        return quizRepository.findBySkillId(skillId);
    }

    // =========================================================
    // ADD QUESTION
    // =========================================================

    public QuizQuestion addQuestion(
            Long quizId,
            String question,
            String optionA,
            String optionB,
            String optionC,
            String optionD,
            String correctAnswer) {

        Quiz quiz =
                quizRepository.findById(quizId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Quiz not found"
                                ));

        QuizQuestion quizQuestion =
                new QuizQuestion(
                        quiz,
                        question,
                        optionA,
                        optionB,
                        optionC,
                        optionD,
                        correctAnswer
                );

        return questionRepository.save(quizQuestion);
    }

    // =========================================================
    // GET QUESTIONS
    // =========================================================

    public List<QuizQuestion> getQuestions(Long quizId) {

        return questionRepository.findByQuizId(quizId);
    }
}