package com.aimentor.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class GeminiService {

    private final ChatClient chatClient;

    public GeminiService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public String generate(String prompt) {

        System.out.println();
        System.out.println("========================================");
        System.out.println("GEMINI REQUEST STARTED");
        System.out.println("========================================");
        System.out.println("Prompt: " + prompt);

        try {

            String response = chatClient
                    .prompt()
                    .user(prompt)
                    .call()
                    .content();

            System.out.println();
            System.out.println("========================================");
            System.out.println("GEMINI RESPONSE RECEIVED");
            System.out.println("========================================");
            System.out.println(response);
            System.out.println("========================================");

            return response;

        } catch (Exception e) {

            System.err.println();
            System.err.println("========================================");
            System.err.println("GEMINI API ERROR");
            System.err.println("========================================");

            System.err.println("Exception Type: "
                    + e.getClass().getName());

            System.err.println("Error Message: "
                    + e.getMessage());

            // Print complete exception
            e.printStackTrace();

            // Find deepest/root cause
            Throwable rootCause = e;

            while (rootCause.getCause() != null) {
                rootCause = rootCause.getCause();
            }

            System.err.println();
            System.err.println("========================================");
            System.err.println("ROOT CAUSE");
            System.err.println("========================================");

            System.err.println("Root Exception Type: "
                    + rootCause.getClass().getName());

            System.err.println("Root Error Message: "
                    + rootCause.getMessage());

            rootCause.printStackTrace();

            System.err.println("========================================");

            throw new RuntimeException(
                    "Gemini API failed: "
                            + rootCause.getMessage(),
                    rootCause
            );
        }
    }
}