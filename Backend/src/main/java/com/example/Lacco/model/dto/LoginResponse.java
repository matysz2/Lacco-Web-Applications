package com.example.Lacco.model.dto;

import java.util.UUID;

/**
 * DTO for login response containing JWT token
 */
public record LoginResponse(
    String token,
    ProfileResponse user
) {}

/**
 * User profile information in response
 */
public record ProfileResponse(
    UUID id,
    String firstName,
    String lastName,
    String email,
    String role
) {}
