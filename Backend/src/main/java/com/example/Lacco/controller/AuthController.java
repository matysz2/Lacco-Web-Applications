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
 * REST Controller for authentication endpoints.
 * Mateusz, I adjusted the path to match your request. 
 * Consistency in routing is key to a professional API.
 */
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost", "http://127.0.0.1:5173"})
@RestController
@RequestMapping("/auth") // Zmieniono z /api/auth na /auth
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final ProfileRepository profileRepository;

    /**
     * Authenticates a user and returns a session token.
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
     * Retrieves current user profile. 
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authorizationHeader) {
        log.info("Fetching profile for current user");
        try {
            String token = authorizationHeader;
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            if (token == null || token.isBlank()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Token missing"));
            }

            UUID userId = UUID.fromString(token);
            Profile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User profile not found"));

            ProfileResponse response = new ProfileResponse(
                profile.getId(),
                profile.getFirstName(),
                profile.getLastName(),
                profile.getEmail(),
                profile.getRole()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Profile retrieval error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Invalid or expired session"));
        }
    }

    /**
     * Handles user logout.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        log.info("Logout request processed");
        return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
    }

    private record ErrorResponse(String error) {}
    private record MessageResponse(String message) {}
}