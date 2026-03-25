package com.example.Lacco.controller;

import com.example.Lacco.model.dto.LoginRequest;
import com.example.Lacco.model.dto.LoginResponse;
import com.example.Lacco.model.dto.ProfileResponse;
import com.example.Lacco.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for authentication endpoints
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    /**
     * Login endpoint
     * POST /auth/login
     *
     * @param loginRequest containing email and password
     * @return LoginResponse with JWT token and user info
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Login request received for email: {}", loginRequest.email());
        try {
            LoginResponse response = authService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Login failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Invalid email or password"));
        }
    }

    /**
     * Get current user profile
     * GET /auth/profile
     *
     * @return Current user's profile
     */
    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Getting profile for user: {}", email);
        ProfileResponse response = authService.getProfile(email);
        return ResponseEntity.ok(response);
    }

    /**
     * Logout endpoint (client-side would remove token)
     * POST /auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        SecurityContextHolder.clearContext();
        log.info("User logged out");
        return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
    }

    /**
     * Error response record
     */
    private record ErrorResponse(String message) {}

    /**
     * Message response record
     */
    private record MessageResponse(String message) {}
}
