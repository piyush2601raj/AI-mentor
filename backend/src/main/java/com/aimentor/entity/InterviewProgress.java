
package com.aimentor.entity;


import jakarta.persistence.*;
import java.time.LocalDateTime;


@Entity
@Table(name = "interview_progress", uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "question_id"}))
public class InterviewProgress {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name="student_id", nullable=false) private Long studentId;
    @Column(name="question_id", nullable=false) private Long questionId;
    @Column(nullable=false) private Integer attempts = 0;
    @Column(nullable=false) private Integer correctAttempts = 0;
    @Column(nullable=false) private boolean mastered = false;
    private String lastAnswer;
    private LocalDateTime lastAttemptAt;


    public InterviewProgress() {}
    public Long getId(){return id;}
    public Long getStudentId(){return studentId;}
    public Long getQuestionId(){return questionId;}
    public Integer getAttempts(){return attempts;}
    public Integer getCorrectAttempts(){return correctAttempts;}
    public boolean isMastered(){return mastered;}
    public String getLastAnswer(){return lastAnswer;}
    public LocalDateTime getLastAttemptAt(){return lastAttemptAt;}
    public void setId(Long v){id=v;}
    public void setStudentId(Long v){studentId=v;}
    public void setQuestionId(Long v){questionId=v;}
    public void setAttempts(Integer v){attempts=v;}
    public void setCorrectAttempts(Integer v){correctAttempts=v;}
    public void setMastered(boolean v){mastered=v;}
    public void setLastAnswer(String v){lastAnswer=v;}
    public void setLastAttemptAt(LocalDateTime v){lastAttemptAt=v;}
}

