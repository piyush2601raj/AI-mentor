package com.aimentor.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "student_skills",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_student_skill",
            columnNames = {"student_id", "skill_id"}
        )
    }
)
public class StudentSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "student_id",
        nullable = false
    )
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "skill_id",
        nullable = false
    )
    private Skill skill;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SkillLevel skillLevel;

    public StudentSkill() {
    }

    public StudentSkill(
            User student,
            Skill skill,
            SkillLevel skillLevel) {

        this.student = student;
        this.skill = skill;
        this.skillLevel = skillLevel;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public Skill getSkill() {
        return skill;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
    }

    public SkillLevel getSkillLevel() {
        return skillLevel;
    }

    public void setSkillLevel(SkillLevel skillLevel) {
        this.skillLevel = skillLevel;
    }
}