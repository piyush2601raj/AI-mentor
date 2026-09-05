package com.aimentor.config;

import com.aimentor.security.OAuth2AuthenticationSuccessHandler;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    // =====================================================
    // PASSWORD ENCODER
    // =====================================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // =====================================================
    // CORS CONFIGURATION
    // =====================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(
                List.of(
                        "http://localhost:*",
                        "http://127.0.0.1:*"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "PATCH",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setExposedHeaders(
                List.of("Authorization")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    // =====================================================
    // JWT AUTHENTICATION CONVERTER
    // =====================================================

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {

        JwtAuthenticationConverter converter =
                new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(jwt -> {

            String role =
                    jwt.getClaimAsString("role");

            if (role == null || role.isBlank()) {
                return List.of();
            }

            return List.of(
                    new SimpleGrantedAuthority(
                            "ROLE_" + role
                    )
            );
        });

        return converter;
    }

    // =====================================================
    // SECURITY FILTER CHAIN
    // =====================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            OAuth2AuthenticationSuccessHandler successHandler
    ) throws Exception {

        http

                // =================================================
                // CORS
                // =================================================

                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )

                // =================================================
                // CSRF
                // =================================================

                .csrf(csrf ->
                        csrf.disable()
                )

                // =================================================
                // SESSION
                // =================================================

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.IF_REQUIRED
                        )
                )

                // =================================================
                // AUTHORIZATION
                // =================================================

                .authorizeHttpRequests(auth -> auth

                        // -------------------------------------------------
                        // OPTIONS / CORS PREFLIGHT
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        // -------------------------------------------------
                        // ERROR
                        // -------------------------------------------------

                        .requestMatchers(
                                "/error",
                                "/favicon.ico"
                        ).permitAll()

                        // -------------------------------------------------
                        // NORMAL AUTH
                        // -------------------------------------------------

                        .requestMatchers(
                                "/auth/**",
                                "/api/auth/**"
                        ).permitAll()

                        // -------------------------------------------------
                        // GOOGLE / GITHUB OAUTH2
                        // -------------------------------------------------

                        .requestMatchers(
                                "/oauth2/**",
                                "/login/**"
                        ).permitAll()

                        // -------------------------------------------------
                        // SKILLS
                        // -------------------------------------------------

                        .requestMatchers(
                                "/api/skills",
                                "/api/skills/**"
                        ).permitAll()

                        // -------------------------------------------------
                        // GEMINI
                        // -------------------------------------------------

                        .requestMatchers(
                                "/api/gemini/**"
                        ).permitAll()

                        // -------------------------------------------------
                        // AI ANALYSIS TEST
                        // -------------------------------------------------

                        .requestMatchers(
                                "/api/ai-analysis/test"
                        ).permitAll()

                        // -------------------------------------------------
                        // INTERVIEW PREPARATION
                        // -------------------------------------------------

                        .requestMatchers(
                                "/api/interview/**"
                        ).authenticated()

                        // -------------------------------------------------
                        // STUDENT SKILLS
                        // -------------------------------------------------

                        .requestMatchers(
                                "/api/students/me/**"
                        ).authenticated()

                        // -------------------------------------------------
                        // ROADMAP
                        // -------------------------------------------------

                        .requestMatchers(
                                "/api/roadmaps/student",
                                "/api/roadmaps/student/**"
                        ).authenticated()

                        // -------------------------------------------------
                        // AI ANALYSIS
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/ai-analysis/generate"
                        ).authenticated()

                        // -------------------------------------------------
                        // EVERYTHING ELSE
                        // -------------------------------------------------

                        .anyRequest().authenticated()
                )

                // =================================================
                // JWT RESOURCE SERVER
                // =================================================

                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt ->
                                jwt.jwtAuthenticationConverter(
                                        jwtAuthenticationConverter()
                                )
                        )
                )

                // =================================================
                // GOOGLE / GITHUB OAUTH2 LOGIN
                // =================================================

                .oauth2Login(oauth2 ->
                        oauth2
                                .successHandler(successHandler)

                                .failureHandler(
                                        (request, response, exception) -> {

                                            exception.printStackTrace();

                                            response.sendRedirect(
                                                    "http://localhost:5173/login?oauthError=oauth"
                                            );
                                        }
                                )
                );

        return http.build();
    }
}