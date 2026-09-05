package com.aimentor.service;

import com.aimentor.dto.InterviewAttemptRequest;
import com.aimentor.dto.InterviewAttemptResponse;
import com.aimentor.dto.InterviewQuestionResponse;
import com.aimentor.dto.InterviewSummaryResponse;
import com.aimentor.entity.InterviewProgress;
import com.aimentor.entity.InterviewQuestion;
import com.aimentor.repository.InterviewProgressRepository;
import com.aimentor.repository.InterviewQuestionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class InterviewPrepService {

    private final InterviewQuestionRepository questionRepository;
    private final InterviewProgressRepository progressRepository;
    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    private static final int AI_QUESTION_COUNT = 20;
    private static final int AI_BATCH_SIZE = 1;
    private static final int AI_MAX_RETRIES = 3;

    public InterviewPrepService(
            InterviewQuestionRepository questionRepository,
            InterviewProgressRepository progressRepository,
            ChatClient.Builder chatClientBuilder,
            ObjectMapper objectMapper) {
        this.questionRepository = questionRepository;
        this.progressRepository = progressRepository;
        this.chatClient = chatClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    // =========================================================
    // GET INTERVIEW QUESTIONS
    // =========================================================

    public List<InterviewQuestionResponse> questions(
            String careerGoal,
            String skill,
            String topic,
            String difficulty,
            Long studentId) {

        String normalizedSkill = skill == null ? "" : skill.trim();
        String normalizedTopic = topic == null ? "" : topic.trim();
        String normalizedDifficulty = difficulty == null ? "" : difficulty.trim();
        String goal = normalizeGoal(careerGoal);

        List<InterviewQuestion> questionList;

        if (!normalizedSkill.isEmpty()
                && !normalizedSkill.equalsIgnoreCase("ALL")) {

            List<InterviewQuestion> skillQuestions =
                    questionRepository.findBySkillIgnoreCaseOrderByIdAsc(normalizedSkill);

            /*
             * Interview Preparation is theory-first.
             * Existing MCQs are intentionally excluded from this flow.
             * If no theory questions exist for the selected skill, AI creates them.
             */
            skillQuestions = skillQuestions.stream()
                    .filter(this::isTheoryQuestion)
                    .toList();

            if (skillQuestions.isEmpty()) {
                skillQuestions = generateAndSaveQuestions(
                        goal,
                        normalizedSkill,
                        normalizedTopic,
                        normalizedDifficulty
                );
            }

            questionList = skillQuestions.stream()
                    .filter(question -> {
                        if (normalizedTopic.isEmpty()
                                || normalizedTopic.equalsIgnoreCase("ALL")) {
                            return true;
                        }
                        return question.getTopic() != null
                                && question.getTopic().trim()
                                .equalsIgnoreCase(normalizedTopic);
                    })
                    .filter(question -> {
                        if (normalizedDifficulty.isEmpty()
                                || normalizedDifficulty.equalsIgnoreCase("ALL")) {
                            return true;
                        }
                        return question.getDifficulty() != null
                                && question.getDifficulty().trim()
                                .equalsIgnoreCase(normalizedDifficulty);
                    })
                    .toList();

            /*
             * If the selected topic/difficulty does not exist in the current
             * theory pool, generate specifically for that selection instead of
             * returning "No questions found".
             */
            if (questionList.isEmpty()
                    && (!normalizedTopic.isEmpty()
                    && !normalizedTopic.equalsIgnoreCase("ALL"))) {

                List<InterviewQuestion> generated =
                        generateAndSaveQuestions(
                                goal,
                                normalizedSkill,
                                normalizedTopic,
                                normalizedDifficulty
                        );

                questionList = generated.stream()
                        .filter(this::isTheoryQuestion)
                        .filter(question ->
                                normalizedTopic.equalsIgnoreCase(
                                        question.getTopic() == null
                                                ? ""
                                                : question.getTopic().trim()))
                        .filter(question -> {
                            if (normalizedDifficulty.isEmpty()
                                    || normalizedDifficulty.equalsIgnoreCase("ALL")) {
                                return true;
                            }
                            return normalizedDifficulty.equalsIgnoreCase(
                                    question.getDifficulty() == null
                                            ? ""
                                            : question.getDifficulty().trim());
                        })
                        .toList();
            }
        } else {
            /*
             * ALL-SKILLS mode also remains theory-only. This prevents old MCQs
             * from appearing in the new professional interview flow.
             */
            if (!normalizedTopic.isEmpty()
                    && !normalizedTopic.equalsIgnoreCase("ALL")) {

                questionList =
                        questionRepository
                                .findByCareerGoalIgnoreCaseAndTopicIgnoreCaseOrderByIdAsc(
                                        goal,
                                        normalizedTopic
                                )
                                .stream()
                                .filter(this::isTheoryQuestion)
                                .toList();

                if (!normalizedDifficulty.isEmpty()
                        && !normalizedDifficulty.equalsIgnoreCase("ALL")) {
                    questionList = questionList.stream()
                            .filter(question ->
                                    question.getDifficulty() != null
                                            && question.getDifficulty()
                                            .trim()
                                            .equalsIgnoreCase(normalizedDifficulty))
                            .toList();
                }
            } else if (!normalizedDifficulty.isEmpty()
                    && !normalizedDifficulty.equalsIgnoreCase("ALL")) {

                questionList =
                        questionRepository
                                .findByCareerGoalIgnoreCaseAndDifficultyIgnoreCaseOrderByIdAsc(
                                        goal,
                                        normalizedDifficulty
                                )
                                .stream()
                                .filter(this::isTheoryQuestion)
                                .toList();
            } else {
                questionList =
                        questionRepository
                                .findByCareerGoalIgnoreCaseOrderByIdAsc(goal)
                                .stream()
                                .filter(this::isTheoryQuestion)
                                .toList();
            }
        }

        Map<Long, InterviewProgress> progressMap = new HashMap<>();

        if (studentId != null) {
            List<InterviewProgress> progressList =
                    progressRepository.findByStudentId(studentId);

            for (InterviewProgress progress : progressList) {
                if (progress.getQuestionId() != null) {
                    progressMap.put(progress.getQuestionId(), progress);
                }
            }
        }

        return questionList.stream()
                .map(question -> {
                    InterviewProgress progress = progressMap.get(question.getId());

                    boolean attempted =
                            progress != null
                                    && progress.getAttempts() != null
                                    && progress.getAttempts() > 0;

                    boolean mastered =
                            progress != null && progress.isMastered();

                    int attempts =
                            progress == null || progress.getAttempts() == null
                                    ? 0
                                    : progress.getAttempts();

                    int correctAttempts =
                            progress == null || progress.getCorrectAttempts() == null
                                    ? 0
                                    : progress.getCorrectAttempts();

                    return new InterviewQuestionResponse(
                            question.getId(),
                            question.getSkill(),
                            question.getTopic(),
                            question.getDifficulty(),
                            question.getQuestion(),
                            "", "", "", "",
                            question.getExplanation(),
                            attempted,
                            mastered,
                            attempts,
                            correctAttempts
                    );
                })
                .toList();
    }

    // =========================================================
    // AI THEORY QUESTION GENERATION
    // =========================================================

    @Transactional
    protected List<InterviewQuestion> generateAndSaveQuestions(
            String careerGoal,
            String skill,
            String topic,
            String difficulty) {

        String requestedTopic =
                topic == null || topic.isBlank() || topic.equalsIgnoreCase("ALL")
                        ? "Cover the most important interview topics automatically"
                        : topic.trim();

        String requestedDifficulty =
                difficulty == null || difficulty.isBlank() || difficulty.equalsIgnoreCase("ALL")
                        ? "Mix EASY, MEDIUM and HARD"
                        : difficulty.trim().toUpperCase();

        List<InterviewQuestion> savedQuestions = new ArrayList<>();
        Set<String> generatedQuestionTexts = new HashSet<>();

        /*
         * Generate one question per AI request. This keeps the JSON response very small
         * and prevents model response truncation / Unexpected end-of-input errors.
         */
        while (savedQuestions.size() < AI_QUESTION_COUNT) {
            int remaining = AI_QUESTION_COUNT - savedQuestions.size();
            int batchSize = Math.min(AI_BATCH_SIZE, remaining);

            List<InterviewQuestion> batch =
                    generateTheoryBatchWithRetry(
                            careerGoal,
                            skill,
                            requestedTopic,
                            requestedDifficulty,
                            batchSize,
                            generatedQuestionTexts
                    );

            if (batch.isEmpty()) {
                break;
            }

            for (InterviewQuestion question : batch) {
                if (savedQuestions.size() >= AI_QUESTION_COUNT) {
                    break;
                }

                String key = normalizeQuestionText(question.getQuestion());
                if (generatedQuestionTexts.add(key)) {
                    savedQuestions.add(question);
                }
            }
        }

        if (savedQuestions.size() < 15) {
            throw new RuntimeException(
                    "AI generated only " + savedQuestions.size()
                            + " valid theory questions. Please retry."
            );
        }

        return questionRepository.saveAll(savedQuestions);
    }

    private List<InterviewQuestion> generateTheoryBatchWithRetry(
            String careerGoal,
            String skill,
            String topic,
            String difficulty,
            int batchSize,
            Set<String> existingQuestions) {

        RuntimeException lastError = null;

        for (int attempt = 1; attempt <= AI_MAX_RETRIES; attempt++) {
            try {
                String prompt = buildTheoryPrompt(
                        careerGoal,
                        skill,
                        topic,
                        difficulty,
                        batchSize,
                        existingQuestions
                );

                String aiResponse = chatClient
                        .prompt()
                        .user(prompt)
                        .call()
                        .content();

                if (aiResponse == null || aiResponse.isBlank()) {
                    throw new RuntimeException("AI returned an empty response");
                }

                String cleanJson = cleanAIJson(aiResponse);
                JsonNode root = objectMapper.readTree(cleanJson);
                JsonNode questionsNode = root.get("questions");

                if (questionsNode == null || !questionsNode.isArray()) {
                    throw new RuntimeException(
                            "Invalid AI response: questions array missing"
                    );
                }

                List<InterviewQuestion> batch = new ArrayList<>();

                for (JsonNode node : questionsNode) {
                    if (batch.size() >= batchSize) {
                        break;
                    }

                    String questionText = text(node, "question");
                    String generatedTopic = text(node, "topic");
                    String generatedDifficulty = text(node, "difficulty");
                    String explanation = text(node, "explanation");

                    /*
                     * "answer" is the preferred AI model-answer field.
                     * "modelAnswer" is accepted as a fallback.
                     */
                    String modelAnswer = text(node, "answer");
                    if (modelAnswer.isBlank()) {
                        modelAnswer = text(node, "modelAnswer");
                    }

                    if (questionText.isBlank() || modelAnswer.isBlank()) {
                        continue;
                    }

                    if (generatedTopic.isBlank()) {
                        generatedTopic =
                                topic.equalsIgnoreCase(
                                        "Cover the most important interview topics automatically")
                                        ? "General"
                                        : topic;
                    }

                    if (generatedDifficulty.isBlank()) {
                        generatedDifficulty =
                                difficulty.equalsIgnoreCase("MIX EASY, MEDIUM AND HARD")
                                        ? "MEDIUM"
                                        : difficulty;
                    }

                    generatedDifficulty =
                            normalizeDifficulty(generatedDifficulty);

                    /*
                     * Theory questions must never have MCQ options.
                     * Store the model answer in explanation because the current
                     * entity already has that field.
                     */
                    InterviewQuestion question = new InterviewQuestion();

                    question.setCareerGoal(careerGoal);
                    question.setSkill(skill);
                    question.setTopic(generatedTopic.trim());
                    question.setDifficulty(generatedDifficulty);
                    question.setQuestion(questionText.trim());

                    question.setOptionA("");
                    question.setOptionB("");
                    question.setOptionC("");
                    question.setOptionD("");
                    question.setCorrectOption("");

                    String fullExplanation =
                            modelAnswer.trim();

                    if (!explanation.isBlank()
                            && !explanation.equalsIgnoreCase(modelAnswer.trim())) {
                        fullExplanation =
                                modelAnswer.trim()
                                        + "\n\nAI Interview Explanation:\n"
                                        + explanation.trim();
                    }

                    question.setExplanation(fullExplanation);

                    String normalizedQuestion =
                            normalizeQuestionText(questionText);

                    if (!existingQuestions.contains(normalizedQuestion)) {
                        batch.add(question);
                    }
                }

                if (batch.isEmpty()) {
                    throw new RuntimeException(
                            "AI returned no valid theory questions"
                    );
                }

                return batch;

            } catch (Exception e) {
                lastError = new RuntimeException(
                        "Theory question generation attempt "
                                + attempt + " failed: " + e.getMessage(),
                        e
                );
            }
        }

        throw lastError != null
                ? lastError
                : new RuntimeException("Unable to generate theory questions");
    }

    private String buildTheoryPrompt(
            String careerGoal,
            String skill,
            String topic,
            String difficulty,
            int count,
            Set<String> existingQuestions) {

        StringBuilder prompt = new StringBuilder();

        prompt.append("""
                You are a senior technical interviewer.
                Generate EXACTLY %d open-ended theory interview questions.

                Career Goal: %s
                Skill: %s
                Topic: %s
                Difficulty: %s

                IMPORTANT:
                - Theory/open-ended questions only.
                - NO MCQs.
                - NO options.
                - NO correctOption.
                - Each question must be different.
                - Keep each answer short: maximum 3 sentences.
                - Keep each explanation short: maximum 2 sentences.
                - Focus only on the selected skill.
                - Return ONLY valid JSON.
                - No markdown or code fences.
                - Do not add text before or after JSON.

                JSON format:
                {
                  "questions": [
                    {
                      "topic": "specific topic",
                      "difficulty": "MEDIUM",
                      "question": "open-ended interview question",
                      "answer": "short interview-ready model answer",
                      "explanation": "short practical explanation"
                    }
                  ]
                }
                """.formatted(
                count,
                careerGoal,
                skill,
                topic,
                difficulty
        ));

        if (!existingQuestions.isEmpty()) {
            prompt.append("\nDo NOT repeat these questions:\n");
            int shown = 0;
            for (String existing : existingQuestions) {
                prompt.append("- ").append(existing).append("\n");
                if (++shown >= 10) {
                    break;
                }
            }
        }

        return prompt.toString();
    }

    // =========================================================
    // AI THEORY ANSWER EVALUATION
    // =========================================================

    private TheoryEvaluation evaluateTheoryAnswer(
            InterviewQuestion question,
            String studentAnswer) {

        String modelAnswer =
                question.getExplanation() == null
                        ? ""
                        : question.getExplanation().trim();

        String prompt = """
                You are a strict but fair technical interviewer.

                Evaluate a student's answer to this theory interview question.

                SKILL:
                %s

                TOPIC:
                %s

                QUESTION:
                %s

                MODEL ANSWER:
                %s

                STUDENT ANSWER:
                %s

                Evaluate whether the student's answer demonstrates sufficient
                technical understanding.

                Return ONLY valid JSON:
                {
                  "correct": true,
                  "score": 85,
                  "feedback": "Concise constructive interview feedback",
                  "modelAnswer": "Professional ideal answer"
                }

                Rules:
                - correct=true when the core technical concept is substantially correct.
                - Minor wording differences are acceptable.
                - Do not require the student's answer to match the model answer word-for-word.
                - score must be 0 to 100.
                - Keep feedback professional and useful.
                - No markdown.
                """.formatted(
                question.getSkill(),
                question.getTopic(),
                question.getQuestion(),
                modelAnswer,
                studentAnswer
        );

        RuntimeException lastError = null;

        for (int attempt = 1; attempt <= AI_MAX_RETRIES; attempt++) {
            try {
                String response = chatClient
                        .prompt()
                        .user(prompt)
                        .call()
                        .content();

                if (response == null || response.isBlank()) {
                    throw new RuntimeException("AI returned empty evaluation");
                }

                JsonNode root =
                        objectMapper.readTree(cleanAIJson(response));

                boolean correct =
                        root.path("correct").asBoolean(false);

                int score =
                        Math.max(
                                0,
                                Math.min(
                                        100,
                                        root.path("score").asInt(correct ? 75 : 30)
                                )
                        );

                String feedback =
                        root.path("feedback").asText("");

                String aiModelAnswer =
                        root.path("modelAnswer").asText("");

                if (aiModelAnswer.isBlank()) {
                    aiModelAnswer = modelAnswer;
                }

                return new TheoryEvaluation(
                        correct,
                        score,
                        feedback,
                        aiModelAnswer
                );

            } catch (Exception e) {
                lastError = new RuntimeException(
                        "Theory answer evaluation failed: " + e.getMessage(),
                        e
                );
            }
        }

        /*
         * If AI evaluation fails, do not destroy the attempt flow.
         * Return a safe evaluation using the stored model answer.
         */
        return new TheoryEvaluation(
                false,
                0,
                "AI evaluation was temporarily unavailable. Review the model answer and try again.",
                modelAnswer
        );
    }

    // =========================================================
    // INTERVIEW SUMMARY
    // =========================================================

    public InterviewSummaryResponse summary(
            String careerGoal,
            Long studentId) {

        String goal = normalizeGoal(careerGoal);

        List<InterviewQuestion> questions =
                questionRepository
                        .findByCareerGoalIgnoreCaseOrderByIdAsc(goal)
                        .stream()
                        .filter(this::isTheoryQuestion)
                        .toList();

        if (studentId == null) {
            return new InterviewSummaryResponse(
                    questions.size(),
                    0,
                    0,
                    0,
                    0
            );
        }

        List<InterviewProgress> progressList =
                progressRepository.findByStudentId(studentId);

        Set<Long> questionIds = new HashSet<>();

        for (InterviewQuestion question : questions) {
            if (question.getId() != null) {
                questionIds.add(question.getId());
            }
        }

        List<InterviewProgress> relevantProgress =
                progressList.stream()
                        .filter(progress ->
                                progress.getQuestionId() != null
                                        && questionIds.contains(progress.getQuestionId()))
                        .toList();

        int attempted =
                (int) relevantProgress.stream()
                        .filter(progress ->
                                progress.getAttempts() != null
                                        && progress.getAttempts() > 0)
                        .count();

        int mastered =
                (int) relevantProgress.stream()
                        .filter(InterviewProgress::isMastered)
                        .count();

        int totalAttempts =
                relevantProgress.stream()
                        .map(InterviewProgress::getAttempts)
                        .filter(value -> value != null)
                        .mapToInt(Integer::intValue)
                        .sum();

        int totalCorrect =
                relevantProgress.stream()
                        .map(InterviewProgress::getCorrectAttempts)
                        .filter(value -> value != null)
                        .mapToInt(Integer::intValue)
                        .sum();

        int accuracy = 0;

        if (totalAttempts > 0) {
            accuracy =
                    Math.round(
                            totalCorrect * 100f / totalAttempts
                    );
        }

        int mastery = 0;

        if (!questions.isEmpty()) {
            mastery =
                    Math.round(
                            mastered * 100f / questions.size()
                    );
        }

        return new InterviewSummaryResponse(
                questions.size(),
                attempted,
                mastered,
                accuracy,
                mastery
        );
    }

    // =========================================================
    // ATTEMPT INTERVIEW QUESTION
    // =========================================================

    @Transactional
    public InterviewAttemptResponse attempt(
            InterviewAttemptRequest request) {

        if (request == null) {
            throw new IllegalArgumentException("Request is required");
        }

        if (request.getStudentId() == null) {
            throw new IllegalArgumentException("Student ID is required");
        }

        if (request.getQuestionId() == null) {
            throw new IllegalArgumentException("Question ID is required");
        }

        InterviewQuestion question =
                questionRepository
                        .findById(request.getQuestionId())
                        .orElseThrow(() ->
                                new IllegalArgumentException("Question not found"));

        String answer =
                request.getAnswer() == null
                        ? ""
                        : request.getAnswer().trim();

        if (answer.isBlank()) {
            throw new IllegalArgumentException("Answer is required");
        }

        boolean theoryQuestion = isTheoryQuestion(question);

        boolean correct;
        String responseExplanation;

        if (theoryQuestion) {
            TheoryEvaluation evaluation =
                    evaluateTheoryAnswer(question, answer);

            correct = evaluation.correct();

            responseExplanation =
                    "Score: " + evaluation.score() + "/100\n\n"
                            + "AI Feedback:\n"
                            + evaluation.feedback()
                            + "\n\nModel Answer:\n"
                            + evaluation.modelAnswer();

        } else {
            /*
             * Backward-compatible MCQ support for legacy records.
             * The new UI never generates these.
             */
            String normalizedAnswer = answer.toUpperCase();
            String correctOption = question.getCorrectOption();

            correct =
                    correctOption != null
                            && !correctOption.isBlank()
                            && correctOption.trim()
                            .equalsIgnoreCase(normalizedAnswer);

            responseExplanation =
                    question.getExplanation() == null
                            ? ""
                            : question.getExplanation();
        }

        InterviewProgress progress =
                progressRepository
                        .findByStudentIdAndQuestionId(
                                request.getStudentId(),
                                question.getId()
                        )
                        .orElseGet(() -> {
                            InterviewProgress newProgress =
                                    new InterviewProgress();

                            newProgress.setStudentId(
                                    request.getStudentId()
                            );
                            newProgress.setQuestionId(
                                    question.getId()
                            );
                            newProgress.setAttempts(0);
                            newProgress.setCorrectAttempts(0);
                            newProgress.setMastered(false);

                            return newProgress;
                        });

        int attempts =
                progress.getAttempts() == null
                        ? 0
                        : progress.getAttempts();

        int correctAttempts =
                progress.getCorrectAttempts() == null
                        ? 0
                        : progress.getCorrectAttempts();

        attempts++;
        progress.setAttempts(attempts);

        if (correct) {
            correctAttempts++;
        }

        progress.setCorrectAttempts(correctAttempts);
        progress.setLastAnswer(answer);
        progress.setLastAttemptAt(LocalDateTime.now());

        /*
         * Theory mastery:
         * - first strong/correct answer can master
         * - otherwise 2 correct attempts master the question
         *
         * This preserves the existing mastery behavior while making it work
         * for AI-evaluated theory answers.
         */
        if (correctAttempts >= 2 || (correct && attempts == 1)) {
            progress.setMastered(true);
        }

        progressRepository.save(progress);

        int mastery;

        if (progress.isMastered()) {
            mastery = 100;
        } else {
            mastery =
                    Math.min(
                            100,
                            Math.round(correctAttempts * 50f)
                    );
        }

        /*
         * For theory questions there is no correct MCQ option.
         * Therefore the last response field is deliberately blank.
         */
        return new InterviewAttemptResponse(
                correct,
                progress.isMastered(),
                attempts,
                correctAttempts,
                mastery,
                responseExplanation,
                theoryQuestion ? "" : question.getCorrectOption()
        );
    }

    // =========================================================
    // THEORY QUESTION DETECTION
    // =========================================================

    private boolean isTheoryQuestion(InterviewQuestion question) {
        if (question == null) {
            return false;
        }

        /*
         * New AI theory questions have no MCQ option and no correct option.
         * This is also useful for filtering old MCQs out of the new UI.
         */
        boolean noOptions =
                isBlank(question.getOptionA())
                        && isBlank(question.getOptionB())
                        && isBlank(question.getOptionC())
                        && isBlank(question.getOptionD());

        boolean noCorrectOption =
                isBlank(question.getCorrectOption());

        return noOptions && noCorrectOption;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    // =========================================================
    // CLEAN AI RESPONSE
    // =========================================================

    private String cleanAIJson(String response) {
        String cleaned = response.trim();

        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7).trim();
        }

        if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3).trim();
        }

        if (cleaned.endsWith("```")) {
            cleaned =
                    cleaned.substring(
                            0,
                            cleaned.length() - 3
                    ).trim();
        }

        int firstBrace = cleaned.indexOf('{');
        int lastBrace = cleaned.lastIndexOf('}');

        if (firstBrace >= 0 && lastBrace > firstBrace) {
            cleaned =
                    cleaned.substring(
                            firstBrace,
                            lastBrace + 1
                    );
        }

        return cleaned;
    }

    // =========================================================
    // JSON TEXT HELPER
    // =========================================================

    private String text(
            JsonNode node,
            String field) {

        JsonNode value = node.get(field);

        if (value == null || value.isNull()) {
            return "";
        }

        return value.asText("");
    }

    private String normalizeQuestionText(String value) {
        if (value == null) {
            return "";
        }

        return value
                .trim()
                .toLowerCase()
                .replaceAll("\\s+", " ");
    }

    private String normalizeDifficulty(String value) {
        if (value == null || value.isBlank()) {
            return "MEDIUM";
        }

        String normalized =
                value.trim().toUpperCase();

        if (normalized.contains("EASY")) {
            return "EASY";
        }

        if (normalized.contains("HARD")) {
            return "HARD";
        }

        return "MEDIUM";
    }

    // =========================================================
    // INTERNAL THEORY EVALUATION RESULT
    // =========================================================

    private record TheoryEvaluation(
            boolean correct,
            int score,
            String feedback,
            String modelAnswer
    ) {
    }

    // =========================================================
    // NORMALIZE CAREER GOAL
    // =========================================================

    public String normalizeGoal(String goal) {

        if (goal == null || goal.trim().isEmpty()) {
            return "SOFTWARE_DEVELOPER";
        }

        String normalized =
                goal
                        .trim()
                        .toUpperCase()
                        .replace("-", "_");

        if (normalized.contains("JAVA")
                || normalized.contains("FULL STACK")
                || normalized.contains("FULLSTACK")
                || normalized.contains("SOFTWARE")) {
            return "SOFTWARE_DEVELOPER";
        }

        if (normalized.contains("DATA")
                && normalized.contains("SCIENT")) {
            return "DATA_SCIENTIST";
        }

        if (normalized.contains("FRONTEND")
                || normalized.contains("FRONT_END")
                || normalized.contains("FRONT END")) {
            return "FRONTEND_DEVELOPER";
        }

        if (normalized.contains("BACKEND")
                || normalized.contains("BACK_END")
                || normalized.contains("BACK END")) {
            return "BACKEND_DEVELOPER";
        }

        if (normalized.contains("DEVOPS")) {
            return "DEVOPS_ENGINEER";
        }

        if (normalized.contains("CLOUD")) {
            return "CLOUD_ENGINEER";
        }

        if (normalized.contains("CYBER")
                || normalized.contains("SECURITY")) {
            return "CYBERSECURITY";
        }

        return normalized;
    }
}
