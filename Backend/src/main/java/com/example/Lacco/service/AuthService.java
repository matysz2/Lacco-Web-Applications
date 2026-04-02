package com.example.Lacco.service;

import com.example.Lacco.model.dto.LoginRequest;
import com.example.Lacco.model.dto.LoginResponse;
import com.example.Lacco.model.dto.ProfileResponse;
import com.example.Lacco.model.entity.Profile;
import com.example.Lacco.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

/**
 * Service for handling authentication operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final ProfileRepository profileRepository;

    public LoginResponse login(LoginRequest loginRequest) {
        log.info("Attempting to authenticate user: {}", loginRequest.email());

        try {
            Profile profile = profileRepository.findByEmail(loginRequest.email())
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Simple password check (no hashing for now)
            if (!loginRequest.password().equals(profile.getPasswordHash())) {
                throw new RuntimeException("Invalid password");
            }

            // Update login timestamp
            profile.setLastLogin(OffsetDateTime.now());
            profileRepository.save(profile);

            // Generate simple token (UUID)
            String token = profile.getId().toString();

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
                    profile.getUpdatedAt()
                )
            );
        } catch (Exception e) {
            log.error("Authentication failed for user: {}", loginRequest.email());
            throw new RuntimeException("Invalid email or password", e);
        }
    }
}
