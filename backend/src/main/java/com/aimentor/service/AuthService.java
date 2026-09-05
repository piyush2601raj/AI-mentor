package com.aimentor.service;

import com.aimentor.entity.Role;
import com.aimentor.entity.User;
import com.aimentor.exception.ResourceNotFoundException;
import com.aimentor.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // =====================================================
    // REGISTER STUDENT
    // =====================================================

    public User registerStudent(
            String name,
            String email,
            String password) {

        if (userRepository.existsByEmail(email)) {

            throw new IllegalArgumentException(
                    "Email already registered"
            );
        }

        User user = new User();

        user.setName(name);
        user.setEmail(email);

        // BCrypt password
        user.setPassword(
                passwordEncoder.encode(password)
        );

        user.setRole(Role.STUDENT);

        return userRepository.save(user);
    }

    // =====================================================
    // LOGIN
    // =====================================================

    public User login(
            String email,
            String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Invalid email or password"
                        )
                );

        // Verify BCrypt password directly
        if (!passwordEncoder.matches(
                password,
                user.getPassword()
        )) {

            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }

        return user;
    }

    // =====================================================
    // GENERATE JWT
    // =====================================================

    public String generateToken(User user) {

        return jwtService.generateToken(user);
    }

    // =====================================================
    // RESET PASSWORD
    // =====================================================

    // Development/testing purpose
    public User resetPassword(
            String email,
            String newPassword) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        user.setPassword(
                passwordEncoder.encode(newPassword)
        );

        return userRepository.save(user);
    }
}