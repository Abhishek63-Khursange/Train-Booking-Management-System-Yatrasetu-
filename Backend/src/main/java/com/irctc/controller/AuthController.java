package com.irctc.controller;

import com.irctc.model.User;
import com.irctc.config.*;
import com.irctc.service.UserService;
import com.irctc.service.EmailService;
import com.irctc.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import org.springframework.security.core.Authentication;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final OtpService otpService;
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody User user) {
        try {
            User registeredUser = userService.register(user);
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
            
            // Send welcome email
            try {
                emailService.sendRegistrationEmail(user.getEmail(), user.getUsername());
                logger.info("Welcome email sent to: {}", user.getEmail());
            } catch (Exception emailError) {
                logger.error("Failed to send welcome email to {}: {}", user.getEmail(), emailError.getMessage());
                // Continue with registration even if email fails
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", registeredUser.getId());
            response.put("username", registeredUser.getUsername());
            response.put("role", registeredUser.getRole());
            response.put("email", registeredUser.getEmail());
            response.put("fullname", registeredUser.getFullname());
            response.put("phone", registeredUser.getPhoneNumber());
            response.put("gender", registeredUser.getGender());
            response.put("token", token);
            response.put("message", "Registration successful! Welcome email sent.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Registration failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, Object>> sendOtp(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String username = request.get("username");
            
            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            if (username == null || username.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
            }
            
            // Send OTP
            otpService.sendOtp(email, username);
            
            return ResponseEntity.ok(Map.of(
                "message", "OTP sent to your email. Please check your inbox.",
                "email", email
            ));
            
        } catch (Exception e) {
            logger.error("Failed to send OTP: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify-otp-and-register")
    public ResponseEntity<Map<String, Object>> verifyOtpAndRegister(@RequestBody Map<String, Object> request) {
        try {
            String email = (String) request.get("email");
            String otp = (String) request.get("otp");
            String username = (String) request.get("username");
            String password = (String) request.get("password");
            String fullname = (String) request.get("fullname");
            String phone = (String) request.get("phone");
            if (phone == null || phone.isBlank()) {
                phone = (String) request.get("phoneNumber"); // Fallback to frontend field name
            }
            String gender = (String) request.get("gender");
            
            // Validate required fields
            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            if (otp == null || otp.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "OTP is required"));
            }
            if (password == null || password.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
            }
            
            // Verify OTP
            boolean isOtpValid = otpService.verifyOtp(email, otp);
            if (!isOtpValid) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired OTP. Please request a new OTP."));
            }
            
            // Create user object
            User user = new User();
            user.setEmail(email);
            user.setUsername(username);
            user.setPassword(password);
            user.setFullname(fullname);
            user.setPhoneNumber(phone);
            user.setGender(gender);
            user.setRole(com.irctc.model.Role.USER); // Force USER role, no admin registration
            
            // Register user
            User registeredUser = userService.register(user);
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
            
            // Send welcome email
            try {
                emailService.sendRegistrationEmail(user.getEmail(), user.getUsername());
                logger.info("Welcome email sent to: {}", user.getEmail());
            } catch (Exception emailError) {
                logger.error("Failed to send welcome email to {}: {}", user.getEmail(), emailError.getMessage());
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", registeredUser.getId());
            response.put("username", registeredUser.getUsername());
            response.put("role", registeredUser.getRole());
            response.put("email", registeredUser.getEmail());
            response.put("fullname", registeredUser.getFullname());
            response.put("phone", registeredUser.getPhoneNumber());
            response.put("gender", registeredUser.getGender());
            response.put("token", token);
            response.put("message", "Registration successful! Welcome to Yatrasetu!");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Registration failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/auth/me")
    public ResponseEntity<?> me(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        return ResponseEntity.ok(Map.of(
            "username", auth.getName(),
            "roles", auth.getAuthorities().stream().map(a -> a.getAuthority()).collect(Collectors.toList())
        ));
    }

    @GetMapping("/login")
    public ResponseEntity<Map<String, String>> loginPage() {
        return ResponseEntity.ok(Map.of(
            "message", "Login page - Use POST method to login",
            "endpoint", "POST /login"
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        try {
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");
            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
            }
            User user = userService.login(email, password);
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            response.put("role", user.getRole());
            response.put("email", user.getEmail());
            response.put("fullname", user.getFullname());
            response.put("phone", user.getPhoneNumber());
            response.put("gender", user.getGender());
            response.put("token", token);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Login failed: {}", e.getMessage());
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }
}