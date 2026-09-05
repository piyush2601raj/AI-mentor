package com.aimentor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AiMentorApplication {

    public static void main(String[] args) {

        SpringApplication.run(AiMentorApplication .class, args);

        System.out.println("=========================================");
        System.out.println(" AI Mentor Platform Started Successfully ");
        System.out.println(" Server Running at: http://localhost:8080");
        System.out.println("=========================================");
    }
}

