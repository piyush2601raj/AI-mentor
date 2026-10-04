package com.aimentor.security;

import com.aimentor.entity.CareerGoal;
import com.aimentor.entity.Role;
import com.aimentor.entity.StudentProfile;
import com.aimentor.entity.User;
import com.aimentor.repository.StudentProfileRepository;
import com.aimentor.repository.UserRepository;
import com.aimentor.service.JwtService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;

import org.springframework.security.oauth2.core.user.OAuth2User;

import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class OAuth2AuthenticationSuccessHandler
        extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger logger =
            LoggerFactory.getLogger(
                    OAuth2AuthenticationSuccessHandler.class
            );

    private static final String FRONTEND_URL =
            "https://ai-mentor-fawn.vercel.app";

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final OAuth2AuthorizedClientService authorizedClientService;

    public OAuth2AuthenticationSuccessHandler(
            UserRepository userRepository,
            StudentProfileRepository studentProfileRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            OAuth2AuthorizedClientService authorizedClientService
    ) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.authorizedClientService = authorizedClientService;
    }

    @Override
    @Transactional
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        logger.info("========================================");
        logger.info("OAUTH2 SUCCESS HANDLER STARTED");
        logger.info("========================================");

        try {

            // =====================================================
            // 1. GET OAUTH USER
            // =====================================================

            if (!(authentication.getPrincipal()
                    instanceof OAuth2User oauthUser)) {

                logger.error(
                        "OAuth principal is not an OAuth2User"
                );

                response.sendRedirect(
                        FRONTEND_URL +
                        "/login?oauthError=principal"
                );

                return;
            }

            logger.info(
                    "OAuth2 user received successfully"
            );

            // =====================================================
            // 2. GET EMAIL
            // =====================================================

            String email =
                    oauthUser.getAttribute("email");

            /*
             * GitHub may return email=null from /user when
             * the email is private.
             *
             * Therefore fetch the authenticated user's
             * email addresses from GitHub /user/emails.
             */

            if ((email == null || email.isBlank())
                    && authentication instanceof OAuth2AuthenticationToken oauthToken
                    && "github".equalsIgnoreCase(
                            oauthToken.getAuthorizedClientRegistrationId()
                    )) {

                logger.info(
                        "GitHub email not present in user profile. Fetching /user/emails..."
                );

                email = fetchGitHubEmail(
                        oauthUser.getName()
                );
            }

            logger.info(
                    "OAuth email received: {}",
                    email
            );

            if (email == null || email.isBlank()) {

                logger.error(
                        "OAuth provider did not provide email"
                );

                response.sendRedirect(
                        FRONTEND_URL +
                        "/login?oauthError=email"
                );

                return;
            }

            // =====================================================
            // 3. GET NAME
            // =====================================================

            String name =
                    oauthUser.getAttribute("name");

            if (name == null || name.isBlank()) {

                name =
                        oauthUser.getAttribute("login");
            }

            if (name == null || name.isBlank()) {

                name = "Student";
            }

            logger.info(
                    "OAuth user name: {}",
                    name
            );

            // =====================================================
            // 4. FIND USER
            // =====================================================

            User user =
                    userRepository
                            .findByEmail(email)
                            .orElse(null);

            // =====================================================
            // 5. CREATE USER IF NOT EXISTS
            // =====================================================

            if (user == null) {

                logger.info(
                        "User not found. Creating OAuth user..."
                );

                User newUser =
                        new User();

                newUser.setName(name);
                newUser.setEmail(email);

                /*
                 * OAuth users do not need a real password.
                 *
                 * User.password is non-null in the database,
                 * so generate a random BCrypt password.
                 */

                newUser.setPassword(
                        passwordEncoder.encode(
                                UUID.randomUUID().toString()
                        )
                );

                newUser.setRole(
                        Role.STUDENT
                );

                user =
                        userRepository.save(newUser);

                logger.info(
                        "OAuth user created successfully. ID={}",
                        user.getId()
                );

            } else {

                logger.info(
                        "Existing user found. ID={}",
                        user.getId()
                );
            }

            // =====================================================
            // 6. CREATE STUDENT PROFILE IF MISSING
            // =====================================================

            StudentProfile profile =
                    studentProfileRepository
                            .findByStudentId(user.getId())
                            .orElse(null);

            if (profile == null) {

                logger.info(
                        "Student profile not found for user ID={}",
                        user.getId()
                );

                logger.info(
                        "Creating default student profile..."
                );

                profile =
                        new StudentProfile();

                profile.setStudent(user);

                profile.setCareerGoal(
                        CareerGoal.SOFTWARE_DEVELOPER
                );

                profile.setExperienceLevel(
                        "BEGINNER"
                );

                profile.setLearningHoursPerDay(
                        2
                );

                LocalDateTime now =
                        LocalDateTime.now();

                profile.setCreatedAt(now);
                profile.setUpdatedAt(now);

                studentProfileRepository.save(profile);

                logger.info(
                        "Student profile created successfully."
                );

            } else {

                logger.info(
                        "Student profile already exists. Profile ID={}",
                        profile.getId()
                );
            }

            // =====================================================
            // 7. GENERATE APPLICATION JWT
            // =====================================================

            logger.info(
                    "Generating application JWT..."
            );

            String token =
                    jwtService.generateToken(user);

            if (token == null || token.isBlank()) {

                logger.error(
                        "JWT generation returned empty token"
                );

                response.sendRedirect(
                        FRONTEND_URL +
                        "/login?oauthError=jwt"
                );

                return;
            }

            logger.info(
                    "JWT generated successfully"
            );

            // =====================================================
            // 8. REDIRECT TO REACT OAUTH CALLBACK
            // =====================================================

            String redirectUrl =
                    FRONTEND_URL +
                    "/oauth2/callback#token=" +
                    token;

            logger.info(
                    "Redirecting OAuth user to React callback"
            );

            logger.info(
                    "OAuth2 login completed successfully"
            );

            logger.info(
                    "========================================"
            );

            logger.info(
                    "OAUTH2 SUCCESS HANDLER FINISHED"
            );

            logger.info(
                    "========================================"
            );

            response.sendRedirect(
                    redirectUrl
            );

        } catch (Exception exception) {

            logger.error(
                    "========================================"
            );

            logger.error(
                    "OAUTH2 SUCCESS HANDLER FAILED"
            );

            logger.error(
                    "Exception Type: {}",
                    exception.getClass().getName()
            );

            logger.error(
                    "Exception Message: {}",
                    exception.getMessage()
            );

            logger.error(
                    "Full OAuth2 success-handler exception",
                    exception
            );

            logger.error(
                    "========================================"
            );

            if (!response.isCommitted()) {

                response.sendRedirect(
                        FRONTEND_URL +
                        "/login?oauthError=success-handler"
                );
            }
        }
    }

    // =========================================================
    // GITHUB EMAIL FETCH
    // =========================================================

    private String fetchGitHubEmail(
            String principalName
    ) {

        try {

            OAuth2AuthorizedClient authorizedClient =
                    authorizedClientService.loadAuthorizedClient(
                            "github",
                            principalName
                    );

            if (authorizedClient == null) {

                logger.error(
                        "GitHub authorized client not found"
                );

                return null;
            }

            if (authorizedClient.getAccessToken() == null) {

                logger.error(
                        "GitHub access token not found"
                );

                return null;
            }

            String accessToken =
                    authorizedClient
                            .getAccessToken()
                            .getTokenValue();

            HttpHeaders headers =
                    new HttpHeaders();

            headers.setBearerAuth(
                    accessToken
            );

            headers.setAccept(
                    List.of(
                            MediaType.APPLICATION_JSON
                    )
            );

            headers.set(
                    "X-GitHub-Api-Version",
                    "2026-03-10"
            );

            HttpEntity<Void> entity =
                    new HttpEntity<>(headers);

            RestTemplate restTemplate =
                    new RestTemplate();

            ResponseEntity<
                    List<Map<String, Object>>
                    > response =
                    restTemplate.exchange(
                            "https://api.github.com/user/emails",
                            HttpMethod.GET,
                            entity,
                            new ParameterizedTypeReference<
                                    List<Map<String, Object>>
                                    >() {}
                    );

            List<Map<String, Object>> emails =
                    response.getBody();

            if (emails == null || emails.isEmpty()) {

                logger.error(
                        "GitHub returned no email addresses"
                );

                return null;
            }

            // =================================================
            // FIRST PRIORITY:
            // VERIFIED + PRIMARY
            // =================================================

            for (Map<String, Object> emailData : emails) {

                boolean primary =
                        Boolean.TRUE.equals(
                                emailData.get("primary")
                        );

                boolean verified =
                        Boolean.TRUE.equals(
                                emailData.get("verified")
                        );

                Object emailObject =
                        emailData.get("email");

                if (primary
                        && verified
                        && emailObject != null) {

                    String email =
                            emailObject.toString();

                    if (!email.isBlank()) {

                        logger.info(
                                "GitHub primary verified email found"
                        );

                        return email;
                    }
                }
            }

            // =================================================
            // SECOND PRIORITY:
            // ANY VERIFIED EMAIL
            // =================================================

            for (Map<String, Object> emailData : emails) {

                boolean verified =
                        Boolean.TRUE.equals(
                                emailData.get("verified")
                        );

                Object emailObject =
                        emailData.get("email");

                if (verified && emailObject != null) {

                    String email =
                            emailObject.toString();

                    if (!email.isBlank()) {

                        logger.info(
                                "GitHub verified email found"
                        );

                        return email;
                    }
                }
            }

            // =================================================
            // THIRD PRIORITY:
            // PRIMARY EMAIL
            // =================================================

            for (Map<String, Object> emailData : emails) {

                boolean primary =
                        Boolean.TRUE.equals(
                                emailData.get("primary")
                        );

                Object emailObject =
                        emailData.get("email");

                if (primary && emailObject != null) {

                    String email =
                            emailObject.toString();

                    if (!email.isBlank()) {

                        logger.info(
                                "GitHub primary email found"
                        );

                        return email;
                    }
                }
            }

            // =================================================
            // LAST PRIORITY:
            // FIRST AVAILABLE EMAIL
            // =================================================

            for (Map<String, Object> emailData : emails) {

                Object emailObject =
                        emailData.get("email");

                if (emailObject != null) {

                    String email =
                            emailObject.toString();

                    if (!email.isBlank()) {

                        logger.info(
                                "GitHub email found"
                        );

                        return email;
                    }
                }
            }

        } catch (Exception exception) {

            logger.error(
                    "Failed to fetch GitHub email",
                    exception
            );
        }

        return null;
    }
}