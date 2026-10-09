package com.aimentor.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.Map;

@RestController
@RequestMapping("/api/code")
public class CodeExecutionController {

    private final RestClient restClient = RestClient.builder()
            .baseUrl("https://ce.judge0.com")
            .build();

    /**
     * Submit source code to Judge0 for execution.
     *
     * POST /api/code/execute
     */
    @PostMapping(
            value = "/execute",
            consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> executeCode(
            @RequestBody Map<String, Object> request) {

        Object sourceCode = request.get("source_code");
        Object languageId = request.get("language_id");

        // Validate required fields
        if (!(sourceCode instanceof String)
                || ((String) sourceCode).isBlank()) {

            return ResponseEntity.badRequest().body(
                    Map.of("error", "source_code is required")
            );
        }

        if (!(languageId instanceof Number)) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "language_id must be a number")
            );
        }

        try {
            Map<?, ?> response = restClient.post()
                    .uri("/submissions/?base64_encoded=false&wait=false")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(Map.class);

            if (response == null) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(Map.of(
                                "error",
                                "Judge0 returned an empty response"
                        ));
            }

            // Usually contains the submission token
            return ResponseEntity.ok(response);

        } catch (RestClientResponseException ex) {

            return ResponseEntity.status(ex.getStatusCode())
                    .body(Map.of(
                            "error", "Judge0 rejected the submission",
                            "details", ex.getResponseBodyAsString()
                    ));

        } catch (Exception ex) {

            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of(
                            "error",
                            "Unable to connect to Judge0"
                    ));
        }
    }

    /**
     * Fetch execution status and output using the submission token.
     *
     * GET /api/code/result/{token}
     */
    @GetMapping("/result/{token}")
    public ResponseEntity<?> getExecutionResult(
            @PathVariable String token) {

        if (token == null
                || !token.matches("[a-zA-Z0-9-]+")) {

            return ResponseEntity.badRequest().body(
                    Map.of("error", "Invalid submission token")
            );
        }

        try {
            Map<?, ?> response = restClient.get()
                    .uri(
                            "/submissions/{token}?base64_encoded=false",
                            token
                    )
                    .retrieve()
                    .body(Map.class);

            if (response == null) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(Map.of(
                                "error",
                                "Judge0 returned an empty response"
                        ));
            }

            // May contain status, stdout, stderr and compile_output
            return ResponseEntity.ok(response);

        } catch (RestClientResponseException ex) {

            return ResponseEntity.status(ex.getStatusCode())
                    .body(Map.of(
                            "error", "Unable to fetch execution result",
                            "details", ex.getResponseBodyAsString()
                    ));

        } catch (Exception ex) {

            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of(
                            "error",
                            "Unable to connect to Judge0"
                    ));
        }
    }
}