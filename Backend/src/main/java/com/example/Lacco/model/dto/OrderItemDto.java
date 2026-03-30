package com.example.Lacco.model.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO for OrderItem entity
 */
public record OrderItemDto(
    UUID id,
    UUID produktId,
    BigDecimal ilosc,
    BigDecimal cenaZastosowana,
    OffsetDateTime createdAt,
    BigDecimal wartoscNetto,
    String nazwa,
    String opakowanie,
    Integer kolorId
) {}