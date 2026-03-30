package com.example.Lacco.controller;

import com.example.Lacco.model.dto.LoginRequest;
import com.example.Lacco.model.dto.LoginResponse;
import com.example.Lacco.model.dto.ProfileResponse;
import com.example.Lacco.model.entity.Profile;
import com.example.Lacco.repository.ProfileRepository;
import com.example.Lacco.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST Controller for authentication endpoints
 */
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost", "http://127.0.0.1:5173"})
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final ProfileRepository profileRepository;

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
     * Get current user endpoint
     * GET /auth/me
     *
     * @param token Authorization token
     * @return ProfileResponse with user info
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authorizationHeader) {
        log.info("Get current user request");
        try {
            String token = authorizationHeader;
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            if (token == null || token.isBlank()) {
                throw new RuntimeException("Token missing");
            }

            UUID userId = UUID.fromString(token);
            Profile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            ProfileResponse response = new ProfileResponse(
                profile.getId(),
                profile.getFirstName(),
                profile.getLastName(),
                profile.getEmail(),
                profile.getRole()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Get current user failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Invalid token"));
        }
    }

    /**
     * Logout endpoint
     * POST /auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        log.info("Logout request");
        return ResponseEntity.ok(new ErrorResponse("Logged out successfully"));
    }

    /**
     * Error response record
     */
    private record ErrorResponse(String message) {}
}
