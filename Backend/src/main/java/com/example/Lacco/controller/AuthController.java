package com.example.Lacco.controller;

import com.example.Lacco.model.dto.LoginRequest;
import com.example.Lacco.model.dto.LoginResponse;
import com.example.Lacco.model.dto.PasswordResetRequest;
import com.example.Lacco.model.dto.ProfileResponse;
import com.example.Lacco.model.entity.Profile;
import com.example.Lacco.repository.ProfileRepository;
import com.example.Lacco.service.AuthService;
import com.example.Lacco.config.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
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
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

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

            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Invalid or expired token"));
            }

            String email = jwtUtil.extractUsername(token);
            Profile profile = profileRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User profile not found"));

            ProfileResponse response = new ProfileResponse(
                profile.getId(),
                profile.getFirstName(),
                profile.getLastName(),
                profile.getEmail(),
                profile.getRole(),
                profile.getCreatedAt(),
                profile.getIsActive(),
                profile.getLastLogin(),
                profile.getUpdatedAt(),
                null // Nie przekazujemy celu sprzedażowego w tym endpointcie
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

    /**
     * Requests a password reset email.
     * Generates a reset token and sends it to the user's email.
     */
    @PostMapping("/request-password-reset")
    public ResponseEntity<?> requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        log.info("Password reset request initiated for email: {}", request.email());
        try {
            authService.requestPasswordReset(request.email());
            return ResponseEntity.ok(new MessageResponse("Password reset link has been sent to your email"));
        } catch (RuntimeException e) {
            log.error("Password reset request failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("Failed to process password reset request"));
        }
    }

    /**
     * Resets user password using token.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        log.info("Password reset request for token: {}", token);
        try {
            Profile profile = profileRepository.findByPasswordResetToken(token);
            if (profile == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Invalid token"));
            }

            if (profile.getTokenExpiry().isBefore(OffsetDateTime.now())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Token expired"));
            }

            profile.setPasswordHash(passwordEncoder.encode(newPassword));
            profile.setPasswordResetToken(null);
            profile.setTokenExpiry(null);
            profile.setUpdatedAt(OffsetDateTime.now());
            profileRepository.save(profile);

            return ResponseEntity.ok(new MessageResponse("Password set successfully"));
        } catch (Exception e) {
            log.error("Password reset error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Password reset failed"));
        }
    }

    private record ErrorResponse(String error) {}
    private record MessageResponse(String message) {}
}