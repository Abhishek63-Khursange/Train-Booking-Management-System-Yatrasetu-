package com.irctc.service;

import com.irctc.Exception.UserNotFoundException;
import com.irctc.model.Role;
import com.irctc.model.User;
import com.irctc.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User register(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            logger.warn("Registration failed: Email already in use: {}", user.getEmail());
            throw new IllegalArgumentException("Email already in use");
        }
        if (userRepository.existsByUsername(user.getUsername())) {
            logger.warn("Registration failed: Username already in use: {}", user.getUsername());
            throw new IllegalArgumentException("Username already in use");
        }
        if (userRepository.existsByPhoneNumber(user.getPhoneNumber())) {
            logger.warn("Registration failed: Phone number already in use: {}", user.getPhoneNumber());
            throw new IllegalArgumentException("Phone number already in use");
        }

        user.setRole(user.getRole() == null ? Role.USER : user.getRole());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        logger.info("Registering user: {}", user.getUsername());
        return userRepository.save(user);
    }

    public User login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Invalid email or password"));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            logger.warn("Login failed for email: {}", email);
            throw new UserNotFoundException("Invalid email or password");
        }
        logger.info("User logged in: {}", user.getUsername());
        return user;
    }
}