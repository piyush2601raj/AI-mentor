package com.aimentor.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "quizzes")
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "module_id",
            nullable = false
    )
    private RoadmapModule module;

    // NEW: Quiz can belong to a Skill
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "skill_id"
    )
    private Skill skill;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer totalQuestions;

    public Quiz() {
    }

    public Quiz(
            RoadmapModule module,
            Skill skill,
            String title,
            String description,
            Integer totalQuestions) {

        this.module = module;
        this.skill = skill;
        this.title = title;
        this.description = description;
        this.totalQuestions = totalQuestions;
    }

    public Long getId() {
        return id;
    }

    public RoadmapModule getModule() {
        return module;
    }

    public void setModule(RoadmapModule module) {
        this.module = module;
    }

    public Skill getSkill() {
        return skill;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }
}