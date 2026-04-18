package com.example.Lacco.service;

import com.example.Lacco.model.dto.LoginRequest;
import com.example.Lacco.model.dto.LoginResponse;
import com.example.Lacco.model.dto.ProfileResponse;
import com.example.Lacco.model.entity.Profile;
import com.example.Lacco.repository.ProfileRepository;
import com.example.Lacco.config.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Service for handling authentication operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public LoginResponse login(LoginRequest loginRequest) {
        log.info("Attempting to authenticate user: {}", loginRequest.email());

        try {
            Profile profile = profileRepository.findByEmail(loginRequest.email())
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Check password
            if (!passwordEncoder.matches(loginRequest.password(), profile.getPasswordHash())) {
                throw new RuntimeException("Invalid password");
            }

            // Update login timestamp
            profile.setLastLogin(OffsetDateTime.now());
            profileRepository.save(profile);

            // Generate JWT token
            String token = jwtUtil.generateToken(profile.getEmail());

            log.info("User {} authenticated successfully", loginRequest.email());

            return new LoginResponse(
                token,
                new ProfileResponse(
                    profile.getId(),
                    profile.getFirstName(),
                    profile.getLastName(),
                    profile.getEmail(),
                    profile.getRole(),
                    profile.getCreatedAt(),
                    profile.getIsActive(),
                    profile.getLastLogin(),
                    profile.getUpdatedAt(),
                    null             // currentMonthGoal is not part of Profile, set to null or calculate if needed
                )
            );
        } catch (Exception e) {
            log.error("Authentication failed for user: {}", loginRequest.email());
            throw new RuntimeException("Invalid email or password", e);
        }
    }

    /**
     * Requests a password reset for a user by email
     * Generates a reset token and sends a reset link via email
     */
    public void requestPasswordReset(String email) {
        log.info("Password reset requested for email: {}", email);

        try {
            Profile profile = profileRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Generate unique reset token
            String resetToken = UUID.randomUUID().toString();

            // Set token expiry to 24 hours from now
            OffsetDateTime tokenExpiry = OffsetDateTime.now().plusHours(24);

            profile.setPasswordResetToken(resetToken);
            profile.setTokenExpiry(tokenExpiry);
            profile.setUpdatedAt(OffsetDateTime.now());

            profileRepository.save(profile);

            // Build reset link
            String resetLink = frontendUrl + "/reset-password?token=" + resetToken;

            // Send reset email
            emailService.sendPasswordResetEmail(email, resetLink);

            log.info("Password reset email sent successfully to: {}", email);
        } catch (Exception e) {
            log.error("Password reset request failed for email {}: {}", email, e.getMessage());
            throw new RuntimeException("Failed to process password reset request", e);
        }
    }
}
