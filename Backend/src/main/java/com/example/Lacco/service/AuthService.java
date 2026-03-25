package com.example.Lacco.service;

import com.example.Lacco.config.JwtProvider;
import com.example.Lacco.model.dto.LoginRequest;
import com.example.Lacco.model.dto.LoginResponse;
import com.example.Lacco.model.dto.ProfileResponse;
import com.example.Lacco.model.entity.Profile;
import com.example.Lacco.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

/**
 * Service for handling authentication operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtProvider jwtProvider;
    private final ProfileRepository profileRepository;

    /**
     * Authenticate user with email and password, return JWT token
     *
     * @param loginRequest containing email and password
     * @return LoginResponse with JWT token and user info
     * @throws AuthenticationException if authentication fails
     */
    public LoginResponse login(LoginRequest loginRequest) {
        log.info("Attempting to authenticate user: {}", loginRequest.email());

        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.email(),
                    loginRequest.password()
                )
            );

            // Get authenticated user
            Profile profile = (Profile) authentication.getPrincipal();

            // Generate JWT token
            String token = jwtProvider.generateToken(profile);
            log.info("User {} authenticated successfully", loginRequest.email());

            // Return response with token and user info
            return new LoginResponse(
                token,
                new ProfileResponse(
                    profile.getId(),
                    profile.getFirstName(),
                    profile.getLastName(),
                    profile.getEmail(),
                    profile.getRole()
                )
            );
        } catch (AuthenticationException e) {
            log.error("Authentication failed for user: {}", loginRequest.email());
            throw new RuntimeException("Invalid email or password", e);
        }
    }

    /**
     * Get current user profile from database
     */
    public ProfileResponse getProfile(String email) {
        Profile profile = profileRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Profile not found"));

        return new ProfileResponse(
            profile.getId(),
            profile.getFirstName(),
            profile.getLastName(),
            profile.getEmail(),
            profile.getRole()
        );
    }
}
