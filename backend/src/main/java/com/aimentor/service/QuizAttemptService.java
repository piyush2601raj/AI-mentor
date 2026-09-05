package com.aimentor.service;

import com.aimentor.entity.ModuleStatus;
import com.aimentor.entity.Quiz;
import com.aimentor.entity.QuizAttempt;
import com.aimentor.entity.QuizQuestion;
import com.aimentor.entity.RoadmapModule;
import com.aimentor.entity.User;
import com.aimentor.repository.QuizAttemptRepository;
import com.aimentor.repository.QuizQuestionRepository;
import com.aimentor.repository.QuizRepository;
import com.aimentor.repository.RoadmapModuleRepository;
import com.aimentor.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class QuizAttemptService {

    private final QuizAttemptRepository attemptRepository;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final RoadmapModuleRepository moduleRepository;

    public QuizAttemptService(
            QuizAttemptRepository attemptRepository,
            QuizRepository quizRepository,
            QuizQuestionRepository questionRepository,
            UserRepository userRepository,
            RoadmapModuleRepository moduleRepository) {

        this.attemptRepository = attemptRepository;
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.userRepository = userRepository;
        this.moduleRepository = moduleRepository;
    }

    @Transactional
    public QuizAttempt submitQuiz(
            Long quizId,
            Long studentId,
            List<String> answers) {

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() ->
                        new RuntimeException("Quiz not found"));

        User student = userRepository.findById(studentId)
                .orElseThrow(() ->
                        new RuntimeException("Student not found"));

        List<QuizQuestion> questions =
                questionRepository.findByQuizId(quizId);

        int totalQuestions = questions.size();

        int correctAnswers = 0;

        for (int i = 0;
             i < questions.size() && i < answers.size();
             i++) {

            String studentAnswer = answers.get(i);

            String correctAnswer =
                    questions.get(i).getCorrectAnswer();

            if (studentAnswer != null
                    && correctAnswer != null
                    && studentAnswer.trim()
                    .equalsIgnoreCase(correctAnswer.trim())) {

                correctAnswers++;
            }
        }

        int wrongAnswers =
                totalQuestions - correctAnswers;

        int score = correctAnswers;

        double percentage = totalQuestions == 0
                ? 0.0
                : ((double) correctAnswers
                / totalQuestions) * 100;

        boolean passed = percentage >= 50;

        /*
         * If student passes the quiz,
         * mark the associated roadmap module
         * as COMPLETED.
         */
        if (passed) {

            RoadmapModule module = quiz.getModule();

            if (module != null) {

                module.setStatus(ModuleStatus.COMPLETED);

                moduleRepository.save(module);
            }
        }

        QuizAttempt attempt = new QuizAttempt(
                quiz,
                student,
                totalQuestions,
                correctAnswers,
                wrongAnswers,
                score,
                percentage,
                passed
        );

        return attemptRepository.save(attempt);
    }

    public List<QuizAttempt> getStudentAttempts(
            Long studentId) {

        return attemptRepository
                .findByStudentId(studentId);
    }

    public List<QuizAttempt> getQuizAttempts(
            Long quizId) {

        return attemptRepository
                .findByQuizId(quizId);
    }
}