package com.example.Lacco.model.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * User profile information in response
 */
public record ProfileResponse(
    UUID id,
    String firstName,
    String lastName,
    String email,
    String role,
    OffsetDateTime createdAt,
    Boolean isActive,
    OffsetDateTime lastLogin,
    OffsetDateTime updatedAt
) {}
