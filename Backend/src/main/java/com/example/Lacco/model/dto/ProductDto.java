package com.example.Lacco.model.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO for Product entity
 */
public record ProductDto(
    UUID id,
    String name,
    String description,
    BigDecimal quantityInStock,
    BigDecimal pricePerKg,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}