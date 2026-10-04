package com.aimentor.security;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

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

@Component
public class OAuth2AuthenticationSuccessHandler
        extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger logger =
            LoggerFactory.getLogger(
                    OAuth2AuthenticationSuccessHandler.class
            );

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public OAuth2AuthenticationSuccessHandler(
            UserRepository userRepository,
            StudentProfileRepository studentProfileRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
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
                        "https://ai-mentor-fawn.vercel.app/login?oauthError=principal"
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

            logger.info(
                    "OAuth email received: {}",
                    email
            );

            if (email == null || email.isBlank()) {

                logger.error(
                        "OAuth provider did not provide email"
                );

                response.sendRedirect(
                        "https://ai-mentor-fawn.vercel.app/login?oauthError=email"
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

                /*
                 * Default career goal.
                 *
                 * User can change this later from
                 * the application/profile flow.
                 */

                profile.setCareerGoal(
                        CareerGoal.SOFTWARE_DEVELOPER
                );

                /*
                 * Default experience level.
                 */

                profile.setExperienceLevel(
                        "BEGINNER"
                );

                /*
                 * Default daily study hours.
                 */

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
                        "https://ai-mentor-fawn.vercel.app/login?oauthError=jwt"
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
                    "https://ai-mentor-fawn.vercel.app/oauth2/callback#token="
                            + token;

            logger.info(
                    "Redirecting OAuth user to React callback"
            );

            logger.info(
                    "OAuth2 login completed successfully for {}",
                    email
            );

            logger.info("========================================");
            logger.info("OAUTH2 SUCCESS HANDLER FINISHED");
            logger.info("========================================");

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
                        "https://ai-mentor-fawn.vercel.app/login?oauthError=success-handler"
                );
            }
        }
    }
}