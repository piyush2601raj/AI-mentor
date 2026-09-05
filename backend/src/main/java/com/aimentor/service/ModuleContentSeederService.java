package com.aimentor.service;

import com.aimentor.entity.LearningContent;
import com.aimentor.entity.LearningContentType;
import com.aimentor.entity.RoadmapModule;
import com.aimentor.repository.LearningContentRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ModuleContentSeederService {

    private final LearningContentRepository contentRepository;

    public ModuleContentSeederService(
            LearningContentRepository contentRepository) {

        this.contentRepository = contentRepository;
    }

    public void createDefaultContents(RoadmapModule module) {

        String title = module.getTitle();

        List<LearningContent> contents = new ArrayList<>();

        /*
         * CONTENT 1
         */
        contents.add(
                new LearningContent(
                        module,
                        "Introduction to " + title,
                        LearningContentType.LESSON,
                        "Understand the fundamentals of "
                                + title
                                + " and learn why this topic is important in real-world software development.",
                        null,
                        1
                )
        );

        /*
         * CONTENT 2
         */
        contents.add(
                new LearningContent(
                        module,
                        title + " Fundamentals",
                        LearningContentType.LESSON,
                        "Learn the core concepts, terminology and fundamental building blocks of "
                                + title
                                + ".",
                        null,
                        2
                )
        );

        /*
         * CONTENT 3
         */
        contents.add(
                new LearningContent(
                        module,
                        "Practical " + title,
                        LearningContentType.TOPIC,
                        "Apply the concepts of "
                                + title
                                + " by building a small practical example.",
                        null,
                        3
                )
        );

        /*
         * CONTENT 4
         */
        contents.add(
                new LearningContent(
                        module,
                        title + " Best Practices",
                        LearningContentType.ARTICLE,
                        "Learn industry best practices, common mistakes and professional approaches used when working with "
                                + title
                                + ".",
                        null,
                        4
                )
        );

        /*
         * CONTENT 5
         */
        contents.add(
                new LearningContent(
                        module,
                        title + " Real World Example",
                        LearningContentType.LESSON,
                        "Explore how "
                                + title
                                + " is used in real-world applications and production projects.",
                        null,
                        5
                )
        );

        /*
         * CONTENT 6
         */
        contents.add(
                new LearningContent(
                        module,
                        title + " Quiz",
                        LearningContentType.QUIZ,
                        "Test your understanding of the concepts covered in this module.",
                        null,
                        6
                )
        );

        contentRepository.saveAll(contents);
    }
}