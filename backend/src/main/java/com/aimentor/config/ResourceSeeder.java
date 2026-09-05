package com.aimentor.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class ResourceSeeder implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public ResourceSeeder(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {

        System.out.println("==============================================");
        System.out.println("📚 AI MENTOR RESOURCE SEEDER STARTED");
        System.out.println("==============================================");

        List<SkillRow> skills = jdbcTemplate.query(
                "SELECT id, name FROM skills ORDER BY id",
                (rs, rowNum) ->
                        new SkillRow(
                                rs.getLong("id"),
                                rs.getString("name")
                        )
        );

        System.out.println("🎯 Skills found in database: " + skills.size());

        int totalInserted = 0;

        for (SkillRow skill : skills) {

            if (skill.name() == null ||
                    skill.name().trim().isEmpty()) {
                continue;
            }

            System.out.println("----------------------------------------------");
            System.out.println("📌 Processing skill: " + skill.name());

            totalInserted += seedResourcesForSkill(skill);
        }

        System.out.println("----------------------------------------------");
        System.out.println("✅ Resources inserted: " + totalInserted);
        System.out.println("🎯 Skills processed: " + skills.size());
        System.out.println("==============================================");
        System.out.println("📚 AI MENTOR RESOURCE SEEDER COMPLETED");
        System.out.println("==============================================");
    }

    // =========================================================
    // CREATE RESOURCES FOR EACH SKILL
    // =========================================================

    private int seedResourcesForSkill(SkillRow skill) {

        String skillName = skill.name().trim();

        String query = URLEncoder.encode(
                skillName,
                StandardCharsets.UTF_8
        );

        int inserted = 0;

        // =====================================================
        // 1. FUNDAMENTALS VIDEO
        // =====================================================

        inserted += insertIfMissing(
                skill.id(),
                skillName + " — Fundamentals",
                "Learn the fundamentals, core concepts and terminology of "
                        + skillName + ".",
                "VIDEO",
                "FUNDAMENTALS",
                youtubeSearch(query + " fundamentals tutorial"),
                null
        );

        // =====================================================
        // 2. COMPLETE COURSE
        // =====================================================

        inserted += insertIfMissing(
                skill.id(),
                skillName + " — Complete Course",
                "A structured learning resource covering important concepts "
                        + "and practical examples for " + skillName + ".",
                "VIDEO",
                "COURSE",
                youtubeSearch(query + " complete course"),
                null
        );

        // =====================================================
        // 3. PROJECTS & PRACTICE
        // =====================================================

        inserted += insertIfMissing(
                skill.id(),
                skillName + " — Projects & Practice",
                "Practice " + skillName
                        + " through projects, exercises and practical implementation.",
                "VIDEO",
                "PRACTICE",
                youtubeSearch(query + " projects practice"),
                null
        );

        // =====================================================
        // 4. INTERVIEW PREPARATION
        // =====================================================

        inserted += insertIfMissing(
                skill.id(),
                skillName + " — Interview Preparation",
                "Prepare for interviews with important "
                        + skillName
                        + " concepts and commonly discussed topics.",
                "VIDEO",
                "INTERVIEW",
                youtubeSearch(query + " interview questions"),
                null
        );

        // =====================================================
        // 5. CHEATSHEET
        // =====================================================

        inserted += insertIfMissing(
                skill.id(),
                skillName + " — Cheatsheet",
                "Quick reference cheatsheet covering important "
                        + skillName + " syntax, concepts and commands.",
                "CHEATSHEET",
                "REFERENCE",
                googleSearch(query + " cheatsheet"),
                null
        );

        // =====================================================
        // 6. ARTICLES & CONCEPTS
        // =====================================================

        inserted += insertIfMissing(
                skill.id(),
                skillName + " — Articles & Concepts",
                "Read articles and explanations covering important "
                        + skillName + " concepts and practical knowledge.",
                "ARTICLE",
                "LEARNING",
                googleSearch(query + " concepts tutorial"),
                null
        );

        // =====================================================
        // 7. CODING / PRACTICE
        // =====================================================

        inserted += insertIfMissing(
                skill.id(),
                skillName + " — Practice",
                "Improve your " + skillName
                        + " skills with coding exercises, questions and practical tasks.",
                "PRACTICE",
                "PRACTICE",
                googleSearch(query + " coding practice"),
                null
        );

        // =====================================================
        // 8. PROJECT IDEAS
        // =====================================================

        inserted += insertIfMissing(
                skill.id(),
                skillName + " — Project Ideas",
                "Build real-world projects using "
                        + skillName + " and strengthen practical development skills.",
                "PROJECT",
                "PROJECT",
                googleSearch(query + " real world projects"),
                null
        );

        // =====================================================
        // 9. OFFICIAL DOCUMENTATION
        // =====================================================

        String officialUrl = getOfficialResourceUrl(skillName);

        if (officialUrl != null) {

            inserted += insertIfMissing(
                    skill.id(),
                    skillName + " — Official Documentation",
                    "Official documentation and reference material for "
                            + skillName + ".",
                    "DOCUMENTATION",
                    "DOCUMENTATION",
                    officialUrl,
                    null
            );
        }

        // =====================================================
        // 10. ROADMAP / LEARNING PATH
        // =====================================================

        inserted += insertIfMissing(
                skill.id(),
                skillName + " — Learning Roadmap",
                "Follow a structured learning roadmap to understand "
                        + skillName + " from fundamentals to advanced concepts.",
                "ROADMAP",
                "LEARNING",
                googleSearch(query + " learning roadmap"),
                null
        );

        return inserted;
    }

    // =========================================================
    // INSERT ONLY IF RESOURCE DOES NOT EXIST
    // =========================================================

    private int insertIfMissing(
            Long skillId,
            String title,
            String description,
            String type,
            String category,
            String url,
            String thumbnailUrl
    ) {

        Integer count = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM resources
                WHERE skill_id = ?
                  AND title = ?
                """,
                Integer.class,
                skillId,
                title
        );

        if (count != null && count > 0) {
            return 0;
        }

        // =====================================================
        // IMPORTANT:
        // created_at and updated_at are NOT NULL in DB.
        // Therefore CURRENT_TIMESTAMP is inserted here.
        // =====================================================

        jdbcTemplate.update(
                """
                INSERT INTO resources
                (
                    skill_id,
                    title,
                    description,
                    type,
                    category,
                    url,
                    thumbnail_url,
                    created_at,
                    updated_at
                )
                VALUES (
                    ?, ?, ?, ?, ?, ?, ?,
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                )
                """,
                skillId,
                title,
                description,
                type,
                category,
                url,
                thumbnailUrl
        );

        System.out.println("   ✅ Added: " + title);

        return 1;
    }

    // =========================================================
    // YOUTUBE SEARCH URL
    // =========================================================

    private String youtubeSearch(String query) {

        return "https://www.youtube.com/results?search_query="
                + query;
    }

    // =========================================================
    // GOOGLE SEARCH URL
    // =========================================================

    private String googleSearch(String query) {

        return "https://www.google.com/search?q="
                + query;
    }

    // =========================================================
    // OFFICIAL DOCUMENTATION
    // =========================================================

    private String getOfficialResourceUrl(String skillName) {

        String skill = skillName
                .toLowerCase()
                .trim();

        // -----------------------------------------------------
        // JAVA
        // -----------------------------------------------------

        if (skill.equals("java")) {
            return "https://dev.java/learn/";
        }

        // -----------------------------------------------------
        // SPRING BOOT
        // -----------------------------------------------------

        if (skill.contains("spring boot")) {
            return "https://spring.io/guides/gs/spring-boot";
        }

        // -----------------------------------------------------
        // SPRING
        // -----------------------------------------------------

        if (skill.equals("spring")) {
            return "https://spring.io/guides";
        }

        // -----------------------------------------------------
        // REACT
        // -----------------------------------------------------

        if (skill.equals("react")) {
            return "https://react.dev/learn";
        }

        // -----------------------------------------------------
        // JAVASCRIPT
        // -----------------------------------------------------

        if (skill.equals("javascript") ||
                skill.equals("java script")) {

            return "https://developer.mozilla.org/en-US/docs/Web/JavaScript";
        }

        // -----------------------------------------------------
        // TYPESCRIPT
        // -----------------------------------------------------

        if (skill.equals("typescript")) {
            return "https://www.typescriptlang.org/docs/";
        }

        // -----------------------------------------------------
        // HTML
        // -----------------------------------------------------

        if (skill.equals("html") ||
                skill.equals("html5")) {

            return "https://developer.mozilla.org/en-US/docs/Web/HTML";
        }

        // -----------------------------------------------------
        // CSS
        // -----------------------------------------------------

        if (skill.equals("css") ||
                skill.equals("css3")) {

            return "https://developer.mozilla.org/en-US/docs/Web/CSS";
        }

        // -----------------------------------------------------
        // PYTHON
        // -----------------------------------------------------

        if (skill.equals("python")) {
            return "https://docs.python.org/3/tutorial/";
        }

        // -----------------------------------------------------
        // SQL
        // -----------------------------------------------------

        if (skill.equals("sql")) {
            return "https://www.postgresql.org/docs/current/tutorial.html";
        }

        // -----------------------------------------------------
        // POSTGRESQL
        // -----------------------------------------------------

        if (skill.contains("postgres")) {
            return "https://www.postgresql.org/docs/";
        }

        // -----------------------------------------------------
        // MYSQL
        // -----------------------------------------------------

        if (skill.contains("mysql")) {
            return "https://dev.mysql.com/doc/";
        }

        // -----------------------------------------------------
        // GIT
        // -----------------------------------------------------

        if (skill.equals("git")) {
            return "https://git-scm.com/doc";
        }

        // -----------------------------------------------------
        // GITHUB
        // -----------------------------------------------------

        if (skill.equals("github")) {
            return "https://docs.github.com/en";
        }

        // -----------------------------------------------------
        // DOCKER
        // -----------------------------------------------------

        if (skill.equals("docker")) {
            return "https://docs.docker.com/get-started/";
        }

        // -----------------------------------------------------
        // KUBERNETES
        // -----------------------------------------------------

        if (skill.contains("kubernetes")) {
            return "https://kubernetes.io/docs/home/";
        }

        // -----------------------------------------------------
        // AWS
        // -----------------------------------------------------

        if (skill.equals("aws") ||
                skill.contains("amazon web services")) {

            return "https://docs.aws.amazon.com/";
        }

        // -----------------------------------------------------
        // AZURE
        // -----------------------------------------------------

        if (skill.contains("azure")) {
            return "https://learn.microsoft.com/en-us/azure/";
        }

        // -----------------------------------------------------
        // C
        // -----------------------------------------------------

        if (skill.equals("c")) {
            return "https://en.cppreference.com/w/c";
        }

        // -----------------------------------------------------
        // C++
        // -----------------------------------------------------

        if (skill.contains("c++")) {
            return "https://en.cppreference.com/w/";
        }

        // -----------------------------------------------------
        // C#
        // -----------------------------------------------------

        if (skill.equals("c#") ||
                skill.equals("c sharp")) {

            return "https://learn.microsoft.com/en-us/dotnet/csharp/";
        }

        // -----------------------------------------------------
        // .NET
        // -----------------------------------------------------

        if (skill.contains(".net") ||
                skill.contains("dotnet")) {

            return "https://learn.microsoft.com/en-us/dotnet/";
        }

        // -----------------------------------------------------
        // ANGULAR
        // -----------------------------------------------------

        if (skill.contains("angular")) {
            return "https://angular.dev/overview";
        }

        // -----------------------------------------------------
        // VUE
        // -----------------------------------------------------

        if (skill.equals("vue") ||
                skill.contains("vue.js")) {

            return "https://vuejs.org/guide/introduction.html";
        }

        // -----------------------------------------------------
        // NODE.JS
        // -----------------------------------------------------

        if (skill.contains("node")) {
            return "https://nodejs.org/en/learn";
        }

        // -----------------------------------------------------
        // EXPRESS
        // -----------------------------------------------------

        if (skill.contains("express")) {
            return "https://expressjs.com/";
        }

        // -----------------------------------------------------
        // MONGODB
        // -----------------------------------------------------

        if (skill.contains("mongo")) {
            return "https://www.mongodb.com/docs/";
        }

        // -----------------------------------------------------
        // DATA SCIENCE
        // -----------------------------------------------------

        if (skill.contains("data science")) {
            return "https://www.python.org/about/gettingstarted/";
        }

        // -----------------------------------------------------
        // MACHINE LEARNING
        // -----------------------------------------------------

        if (skill.contains("machine learning")) {
            return "https://scikit-learn.org/stable/user_guide.html";
        }

        // -----------------------------------------------------
        // ARTIFICIAL INTELLIGENCE
        // -----------------------------------------------------

        if (skill.equals("ai") ||
                skill.contains("artificial intelligence")) {

            return "https://developers.google.com/machine-learning";
        }

        // -----------------------------------------------------
        // DEEP LEARNING
        // -----------------------------------------------------

        if (skill.contains("deep learning")) {
            return "https://www.tensorflow.org/learn";
        }

        // -----------------------------------------------------
        // TENSORFLOW
        // -----------------------------------------------------

        if (skill.contains("tensorflow")) {
            return "https://www.tensorflow.org/learn";
        }

        // -----------------------------------------------------
        // PYTORCH
        // -----------------------------------------------------

        if (skill.contains("pytorch")) {
            return "https://pytorch.org/tutorials/";
        }

        // -----------------------------------------------------
        // CYBERSECURITY
        // -----------------------------------------------------

        if (skill.contains("cyber")) {
            return "https://owasp.org/www-project-web-security-testing-guide/";
        }

        // -----------------------------------------------------
        // NETWORKING
        // -----------------------------------------------------

        if (skill.contains("network")) {
            return "https://developer.mozilla.org/en-US/docs/Web/HTTP";
        }

        // -----------------------------------------------------
        // LINUX
        // -----------------------------------------------------

        if (skill.contains("linux")) {
            return "https://www.kernel.org/doc/html/latest/";
        }

        // -----------------------------------------------------
        // DSA
        // -----------------------------------------------------

        if (skill.contains("data structure") ||
                skill.equals("dsa") ||
                skill.contains("algorithms")) {

            return "https://www.geeksforgeeks.org/dsa/";
        }

        // -----------------------------------------------------
        // REST API
        // -----------------------------------------------------

        if (skill.contains("rest")) {
            return "https://developer.mozilla.org/en-US/docs/Glossary/REST";
        }

        // -----------------------------------------------------
        // GENERIC
        // -----------------------------------------------------

        return null;
    }

    // =========================================================
    // SMALL RECORD
    // =========================================================

    private record SkillRow(
            Long id,
            String name
    ) {
    }
}