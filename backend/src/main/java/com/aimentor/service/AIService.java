package com.aimentor.service;

import com.aimentor.entity.StudentProfile;
import com.aimentor.entity.StudentSkill;
import com.aimentor.repository.StudentProfileRepository;
import com.aimentor.repository.StudentSkillRepository;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AIService {

    private final ChatClient chatClient;
    private final StudentProfileRepository studentProfileRepository;
    private final StudentSkillRepository studentSkillRepository;

    public AIService(
            ChatClient.Builder chatClientBuilder,
            StudentProfileRepository studentProfileRepository,
            StudentSkillRepository studentSkillRepository) {

        this.chatClient = chatClientBuilder.build();
        this.studentProfileRepository = studentProfileRepository;
        this.studentSkillRepository = studentSkillRepository;
    }

    // =========================================================
    // EXISTING AI CHAT
    // =========================================================

    public String chat(String message) {

        return chatClient
                .prompt()
                .user(message)
                .call()
                .content();
    }


    // =========================================================
    // AI SKILL ANALYSIS
    // =========================================================

    public String analyzeSkills(Long studentId) {

        // -----------------------------------------------------
        // Get student profile
        // -----------------------------------------------------

        StudentProfile profile =
                studentProfileRepository
                        .findByStudentId(studentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Student profile not found"
                                )
                        );


        // -----------------------------------------------------
        // Get student skills
        // -----------------------------------------------------

        List<StudentSkill> skills =
                studentSkillRepository
                        .findByStudentId(studentId);


        if (skills.isEmpty()) {

            throw new RuntimeException(
                    "Please complete skill assessment first"
            );
        }


        // -----------------------------------------------------
        // Build skill information
        // -----------------------------------------------------

        StringBuilder skillInformation =
                new StringBuilder();

        for (StudentSkill studentSkill : skills) {

            skillInformation
                    .append("- ")
                    .append(studentSkill.getSkill().getName())
                    .append(" : ")
                    .append(studentSkill.getSkillLevel().name())
                    .append("\n");
        }


        // -----------------------------------------------------
        // Build AI prompt
        // -----------------------------------------------------

        String prompt = """

                You are an expert AI career mentor.

                Analyze the student's profile and current
                technical skills.

                Student Career Goal:
                %s

                Experience Level:
                %s

                Daily Study Hours:
                %s hours

                Current Skills:
                %s

                Give a personalized learning analysis.

                Your response MUST contain these sections:

                1. Overall Analysis
                2. Strong Skills
                3. Skills That Need Improvement
                4. Priority Skills
                5. Recommended Learning Order
                6. Personalized Recommendations

                Be practical and specific.

                Do not recommend skills unrelated to the
                student's career goal.

                Keep the response concise but useful.
                """.formatted(

                profile.getCareerGoal().name(),

                profile.getExperienceLevel(),

                profile.getLearningHoursPerDay(),

                skillInformation.toString()
        );


        // -----------------------------------------------------
        // Call AI
        // -----------------------------------------------------

        return chatClient
                .prompt()
                .user(prompt)
                .call()
                .content();
    }
}