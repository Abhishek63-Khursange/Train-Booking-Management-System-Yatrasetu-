package com.irctc.config;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "admin";
        String encodedPassword = encoder.encode(password);
        System.out.println("Encoded password: " + encodedPassword);
    }
}