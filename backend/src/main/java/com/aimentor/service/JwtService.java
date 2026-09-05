package com.aimentor.service;

import com.aimentor.entity.User;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;

    public JwtService(JwtEncoder jwtEncoder) {
        this.jwtEncoder = jwtEncoder;
    }

    // =====================================================
    // GENERATE JWT
    // =====================================================

    public String generateToken(User user) {

        Instant now = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("ai-mentor")
                .subject(user.getEmail())
                .issuedAt(now)
                .expiresAt(now.plusSeconds(24 * 60 * 60))

                // Current logged-in user
                .claim("userId", user.getId())

                // User role
                .claim("role", user.getRole().name())

                .build();

        // =================================================
        // TEMPORARY DEBUG
        // =================================================

        System.out.println("========================================");
        System.out.println("JWT GENERATION DEBUG");
        System.out.println("========================================");

        System.out.println("JWT userId : " + claims.getClaim("userId"));
        System.out.println("JWT role   : " + claims.getClaim("role"));
        System.out.println("JWT subject: " + claims.getSubject());

        // IMPORTANT:
        // DO NOT use claims.getIssuer() or jwt.getIssuer()
        // for this temporary debug because Spring Security
        // expects issuer as URL.

        System.out.println("JWT issuer : " + claims.getClaim("iss"));

        System.out.println("========================================");

        // =================================================
        // JWT HEADER
        // =================================================

        JwsHeader header = JwsHeader
                .with(MacAlgorithm.HS256)
                .build();

        System.out.println("JWT algorithm: HS256");
        System.out.println("Encoding JWT...");

        // =================================================
        // GENERATE TOKEN
        // =================================================

        String token = jwtEncoder
                .encode(
                        JwtEncoderParameters.from(
                                header,
                                claims
                        )
                )
                .getTokenValue();

        System.out.println("JWT generated successfully");

        // =================================================
        // TEMPORARY TOKEN DEBUG
        // =================================================

        if (token != null && !token.isBlank()) {
            System.out.println("JWT token received successfully");
            System.out.println("JWT token length: " + token.length());
        } else {
            System.out.println("ERROR: JWT token is null or empty");
        }

        System.out.println("========================================");

        return token;
    }

    // =====================================================
    // CURRENT AUTHENTICATED USER
    // =====================================================

    private Jwt getCurrentJwt() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        Object principal = authentication.getPrincipal();

        if (!(principal instanceof Jwt jwt)) {

            throw new RuntimeException(
                    "Invalid JWT authentication"
            );
        }

        return jwt;
    }

    // =====================================================
    // CURRENT USER ID
    // =====================================================

    public Long getCurrentUserId() {

        Jwt jwt = getCurrentJwt();

        Number userId = jwt.getClaim("userId");

        if (userId == null) {

            throw new RuntimeException(
                    "User ID not found in JWT"
            );
        }

        return userId.longValue();
    }

    // =====================================================
    // CURRENT USER EMAIL
    // =====================================================

    public String getCurrentUserEmail() {

        return getCurrentJwt().getSubject();
    }

    // =====================================================
    // CURRENT USER ROLE
    // =====================================================

    public String getCurrentUserRole() {

        return getCurrentJwt()
                .getClaimAsString("role");
    }
}