package com.example.Lacco.model.dto;

/**
 * DTO for login response containing JWT token
 */
public record LoginResponse(
    String token,
    ProfileResponse user
) {}
