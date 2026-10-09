package com.aimentor.service;

import com.aimentor.dto.FlashcardResponse;
import com.aimentor.dto.GenerateFlashcardsRequest;
import com.aimentor.entity.*;
import com.aimentor.repository.FlashcardProgressRepository;
import com.aimentor.repository.FlashcardRepository;
import com.aimentor.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Transactional
public class FlashcardService {

    private final FlashcardRepository flashcardRepository;
    private final FlashcardProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public FlashcardService(
            FlashcardRepository flashcardRepository,
            FlashcardProgressRepository progressRepository,
            UserRepository userRepository,
            JwtService jwtService,
            GeminiService geminiService,
            ObjectMapper objectMapper) {
        this.flashcardRepository = flashcardRepository;
        this.progressRepository = progressRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.geminiService = geminiService;
        this.objectMapper = objectMapper;
    }

    private User currentUser() {
        Long userId;
        try {
            userId = jwtService.getCurrentUserId();
        } catch (RuntimeException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please log in to use flashcards");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found"));
    }

    @Transactional(readOnly = true)
    public List<FlashcardResponse> getCards(String topic, String difficulty, String search) {
        User user = currentUser();
        List<Flashcard> cards = flashcardRepository.findByOwnerIdOrderByCreatedAtDesc(user.getId());

        if (topic != null && !topic.isBlank() && !"ALL".equalsIgnoreCase(topic)) {
            cards = cards.stream()
                    .filter(c -> c.getTopicName().equalsIgnoreCase(topic.trim()))
                    .toList();
        }
        if (difficulty != null && !difficulty.isBlank() && !"ALL".equalsIgnoreCase(difficulty)) {
            FlashcardDifficulty parsed = parseDifficulty(difficulty);
            cards = cards.stream().filter(c -> c.getDifficulty() == parsed).toList();
        }
        if (search != null && !search.isBlank()) {
            String query = search.trim().toLowerCase(Locale.ROOT);
            cards = cards.stream().filter(c ->
                    c.getQuestion().toLowerCase(Locale.ROOT).contains(query)
                    || c.getAnswer().toLowerCase(Locale.ROOT).contains(query)
                    || c.getTopicName().toLowerCase(Locale.ROOT).contains(query)
            ).toList();
        }
        return cards.stream().map(FlashcardResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<String> getTopics() {
        User user = currentUser();
        return flashcardRepository.findDistinctTopicsByOwnerId(user.getId());
    }

    @Transactional(readOnly = true)
    public Map<Long, String> getProgress() {
        User user = currentUser();
        Map<Long, String> result = new LinkedHashMap<>();
        progressRepository.findByStudentId(user.getId()).forEach(p ->
                result.put(p.getFlashcard().getId(), p.getStatus().name()));
        return result;
    }

    public Map<String, Object> updateProgress(Long cardId, String statusValue) {
        User user = currentUser();
        Flashcard card = flashcardRepository.findByIdAndOwnerId(cardId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Flashcard not found"));

        if (statusValue == null || statusValue.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Progress status is required");
        }

        FlashcardProgressStatus status;
        try {
            status = FlashcardProgressStatus.valueOf(statusValue.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Status must be GOT_IT, NEED_REVISION, or DIFFICULT");
        }

        FlashcardProgress progress = progressRepository
                .findByStudentIdAndFlashcardId(user.getId(), cardId)
                .orElseGet(() -> new FlashcardProgress(user, card, status));
        progress.setStatus(status);
        progressRepository.save(progress);

        return Map.of("cardId", cardId, "status", status.name());
    }

    public List<FlashcardResponse> generate(GenerateFlashcardsRequest request) {
        User user = currentUser();

        if (request == null || request.getTopic() == null || request.getTopic().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Topic is required");
        }

        String topic = request.getTopic().trim();
        if (topic.length() > 150) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Topic must be 150 characters or fewer");
        }

        int count = request.getCount() == null ? 10 : request.getCount();
        if (count < 1 || count > 30) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Count must be between 1 and 30");
        }

        FlashcardDifficulty difficulty = parseDifficulty(
                request.getDifficulty() == null ? "MEDIUM" : request.getDifficulty());

        String prompt = """
            You are a careful technical tutor creating study flashcards.
            Create exactly %d concise, accurate flashcards about the topic: "%s".
            Target difficulty: %s.
            Return ONLY a valid JSON array. No markdown fences and no prose.
            Each array item must have exactly these string fields:
            {"question":"...","answer":"..."}.
            Questions should test understanding, not just vague definitions.
            Answers should be accurate, self-contained, and concise.
            Avoid duplicates and do not invent facts.
            """.formatted(count, topic, difficulty.name());

        final String raw;
        try {
            raw = geminiService.generate(prompt);
        } catch (RuntimeException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "AI flashcard generation failed. Please try again later.");
        }

        List<Map<String, Object>> generated;
        try {
            String json = extractJsonArray(raw);
            generated = objectMapper.readValue(json, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "AI returned an unreadable response. Please generate the cards again.");
        }

        List<Flashcard> toSave = new ArrayList<>();
        for (Map<String, Object> item : generated) {
            String question = asText(item.get("question"));
            String answer = asText(item.get("answer"));
            if (question.isBlank() || answer.isBlank()) continue;
            if (question.length() > 2000 || answer.length() > 5000) continue;
            toSave.add(new Flashcard(user, topic, question, answer, difficulty));
            if (toSave.size() == count) break;
        }

        if (toSave.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "AI did not return valid flashcards. Please try again.");
        }

        return flashcardRepository.saveAll(toSave).stream()
                .map(FlashcardResponse::from)
                .toList();
    }

    private FlashcardDifficulty parseDifficulty(String value) {
        try {
            return FlashcardDifficulty.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Difficulty must be EASY, MEDIUM, or HARD");
        }
    }

    private String asText(Object value) {
        return value == null ? "" : value.toString().trim();
    }

    private String extractJsonArray(String response) {
        if (response == null || response.isBlank()) return "[]";
        String cleaned = response.trim().replaceAll("(?s)^```(?:json)?\\s*", "")
                .replaceAll("(?s)\\s*```$", "");
        int start = cleaned.indexOf('[');
        int end = cleaned.lastIndexOf(']');
        if (start < 0 || end < start) {
            throw new IllegalArgumentException("JSON array not found");
        }
        return cleaned.substring(start, end + 1);
    }
}
