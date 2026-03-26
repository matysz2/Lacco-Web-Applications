package com.example.Lacco.model.dto;

import java.util.UUID;

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
