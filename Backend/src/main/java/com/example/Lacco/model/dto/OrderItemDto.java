package com.example.Lacco.model.dto;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO for OrderItem entity
 */
public record OrderItemDto(
    UUID id,
    UUID orderId,
    UUID productId,
    String productName,
    BigDecimal quantity,
    BigDecimal pricePerUnit,
    BigDecimal totalPrice,
    BigDecimal weight
) {}