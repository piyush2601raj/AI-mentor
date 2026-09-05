package com.aimentor.config;

import com.aimentor.entity.Skill;
import com.aimentor.repository.SkillRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SkillDataInitializer {

    @Bean
    CommandLineRunner initializeSkills(SkillRepository skillRepository) {

        return args -> {

            List<SkillData> skills = List.of(

                // ================= PROGRAMMING =================

                new SkillData(
                        "Java",
                        "Programming",
                        "Object-oriented programming language widely used for enterprise and backend development."
                ),

                new SkillData(
                        "Python",
                        "Programming",
                        "General-purpose programming language widely used in software development, automation and data science."
                ),

                new SkillData(
                        "C++",
                        "Programming",
                        "High-performance programming language commonly used for systems programming and competitive programming."
                ),

                new SkillData(
                        "C",
                        "Programming",
                        "Foundational programming language used for systems and low-level software development."
                ),

                new SkillData(
                        "JavaScript",
                        "Programming",
                        "Programming language used to build interactive web applications."
                ),

                new SkillData(
                        "TypeScript",
                        "Programming",
                        "Typed superset of JavaScript used for scalable application development."
                ),

                new SkillData(
                        "Go",
                        "Programming",
                        "Programming language designed for scalable and efficient backend systems."
                ),

                // ================= FRONTEND =================

                new SkillData(
                        "HTML",
                        "Frontend",
                        "Markup language used to structure web pages and applications."
                ),

                new SkillData(
                        "CSS",
                        "Frontend",
                        "Stylesheet language used to design and layout web applications."
                ),

                new SkillData(
                        "React",
                        "Frontend",
                        "JavaScript library for building modern component-based user interfaces."
                ),

                new SkillData(
                        "Angular",
                        "Frontend",
                        "Framework for building scalable web applications."
                ),

                new SkillData(
                        "Vue.js",
                        "Frontend",
                        "Progressive JavaScript framework for building user interfaces."
                ),

                new SkillData(
                        "Tailwind CSS",
                        "Frontend",
                        "Utility-first CSS framework for building modern responsive interfaces."
                ),

                // ================= BACKEND =================

                new SkillData(
                        "Spring Boot",
                        "Backend",
                        "Java framework for building production-ready backend and REST applications."
                ),

                new SkillData(
                        "Spring Security",
                        "Backend",
                        "Security framework for authentication, authorization and application protection."
                ),

                new SkillData(
                        "Node.js",
                        "Backend",
                        "JavaScript runtime commonly used for scalable backend applications."
                ),

                new SkillData(
                        "Express.js",
                        "Backend",
                        "Minimal Node.js framework for building web APIs and backend services."
                ),

                new SkillData(
                        "REST API",
                        "Backend",
                        "Architectural approach for designing HTTP-based web APIs."
                ),

                // ================= DATABASE =================

                new SkillData(
                        "SQL",
                        "Database",
                        "Language used to manage and query relational databases."
                ),

                new SkillData(
                        "MySQL",
                        "Database",
                        "Popular relational database management system."
                ),

                new SkillData(
                        "PostgreSQL",
                        "Database",
                        "Advanced open-source relational database management system."
                ),

                new SkillData(
                        "MongoDB",
                        "Database",
                        "Document-oriented NoSQL database used for flexible data storage."
                ),

                new SkillData(
                        "Redis",
                        "Database",
                        "In-memory data store commonly used for caching and fast data access."
                ),

                // ================= AI / ML =================

                new SkillData(
                        "Artificial Intelligence",
                        "AI/ML",
                        "Field focused on building systems capable of intelligent behavior."
                ),

                new SkillData(
                        "Machine Learning",
                        "AI/ML",
                        "Algorithms and techniques used to build predictive models from data."
                ),

                new SkillData(
                        "Deep Learning",
                        "AI/ML",
                        "Machine learning approach based on neural networks."
                ),

                new SkillData(
                        "Natural Language Processing",
                        "AI/ML",
                        "Techniques for processing and understanding human language."
                ),

                new SkillData(
                        "Generative AI",
                        "AI/ML",
                        "AI techniques used to generate text, images, code and other content."
                ),

                // ================= CLOUD =================

                new SkillData(
                        "AWS",
                        "Cloud",
                        "Cloud computing platform providing infrastructure and application services."
                ),

                new SkillData(
                        "Microsoft Azure",
                        "Cloud",
                        "Cloud platform providing compute, storage, networking and application services."
                ),

                new SkillData(
                        "Google Cloud",
                        "Cloud",
                        "Cloud computing platform for applications, data and machine learning."
                ),

                // ================= DEVOPS =================

                new SkillData(
                        "Git",
                        "DevOps",
                        "Distributed version control system used to manage source code."
                ),

                new SkillData(
                        "GitHub",
                        "DevOps",
                        "Platform for hosting, collaborating and managing software repositories."
                ),

                new SkillData(
                        "Docker",
                        "DevOps",
                        "Containerization platform for packaging and running applications consistently."
                ),

                new SkillData(
                        "Kubernetes",
                        "DevOps",
                        "Platform for orchestrating containerized applications."
                ),

                new SkillData(
                        "Jenkins",
                        "DevOps",
                        "Automation server commonly used for CI/CD pipelines."
                ),

                new SkillData(
                        "CI/CD",
                        "DevOps",
                        "Practices for automating software integration, testing and deployment."
                ),

                new SkillData(
                        "Terraform",
                        "DevOps",
                        "Infrastructure-as-code tool for provisioning cloud infrastructure."
                ),

                // ================= CYBER SECURITY =================

                new SkillData(
                        "Cyber Security",
                        "Cyber Security",
                        "Protection of systems, applications, networks and data from security threats."
                ),

                new SkillData(
                        "Ethical Hacking",
                        "Cyber Security",
                        "Authorized security testing used to identify vulnerabilities."
                ),

                new SkillData(
                        "Network Security",
                        "Cyber Security",
                        "Techniques for protecting computer networks and communication systems."
                ),

                new SkillData(
                        "OWASP",
                        "Cyber Security",
                        "Security practices and resources for identifying and preventing web application vulnerabilities."
                ),

                new SkillData(
                        "Cryptography",
                        "Cyber Security",
                        "Techniques for protecting information using encryption and cryptographic algorithms."
                ),

                // ================= CS FUNDAMENTALS =================

                new SkillData(
                        "Data Structures & Algorithms",
                        "CS Fundamentals",
                        "Core algorithms and data structures used to solve computational problems."
                ),

                new SkillData(
                        "Object Oriented Programming",
                        "CS Fundamentals",
                        "Programming paradigm based on objects, classes, inheritance and polymorphism."
                ),

                new SkillData(
                        "DBMS",
                        "CS Fundamentals",
                        "Fundamentals of database management systems."
                ),

                new SkillData(
                        "Operating Systems",
                        "CS Fundamentals",
                        "Fundamentals of processes, memory, scheduling and operating system architecture."
                ),

                new SkillData(
                        "Computer Networks",
                        "CS Fundamentals",
                        "Fundamentals of networking, protocols and communication systems."
                ),

                // ================= DATA =================

                new SkillData(
                        "Data Science",
                        "Data",
                        "Using statistics, programming and machine learning to extract insights from data."
                ),

                new SkillData(
                        "Data Analytics",
                        "Data",
                        "Analyzing datasets to discover trends and support decision making."
                ),

                new SkillData(
                        "Power BI",
                        "Data",
                        "Business intelligence and data visualization platform."
                ),

                new SkillData(
                        "Tableau",
                        "Data",
                        "Data visualization and business intelligence platform."
                ),

                // ================= MOBILE =================

                new SkillData(
                        "Android",
                        "Mobile",
                        "Platform and ecosystem for building Android mobile applications."
                ),

                new SkillData(
                        "Flutter",
                        "Mobile",
                        "Framework for building cross-platform applications."
                ),

                new SkillData(
                        "React Native",
                        "Mobile",
                        "Framework for building cross-platform mobile applications using React."
                )
            );

            for (SkillData data : skills) {

                if (!skillRepository.existsByNameIgnoreCase(data.name())) {

                    Skill skill = new Skill();

                    skill.setName(data.name());
                    skill.setCategory(data.category());
                    skill.setDescription(data.description());

                    skillRepository.save(skill);
                }
            }

            System.out.println("Skill catalog initialized successfully.");
        };
    }

    private record SkillData(
            String name,
            String category,
            String description
    ) {
    }
}