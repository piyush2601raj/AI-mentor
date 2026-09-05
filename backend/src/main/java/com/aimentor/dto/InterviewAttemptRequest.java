package com.aimentor.dto;

public class InterviewAttemptRequest {
    private Long studentId;
    private Long questionId;
    private String answer;
    public InterviewAttemptRequest() {}
    public Long getStudentId(){return studentId;}
    public Long getQuestionId(){return questionId;}
    public String getAnswer(){return answer;}
    public void setStudentId(Long v){studentId=v;}
    public void setQuestionId(Long v){questionId=v;}
    public void setAnswer(String v){answer=v;}
}
