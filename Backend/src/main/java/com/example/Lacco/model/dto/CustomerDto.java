package com.example.Lacco.model.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO for Customer entity
 */
public record CustomerDto(
    UUID id,
    String name,
    String contactInfo,
    String address,
    String phone,
    String email,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}