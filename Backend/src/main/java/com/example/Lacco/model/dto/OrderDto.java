package com.example.Lacco.model.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO for Order entity
 */
public record OrderDto(
    UUID id,
    UUID customerId,
    String customerName,
    UUID salesmanId,
    String salesmanName,
    String status,
    BigDecimal totalAmount,
    BigDecimal totalWeight,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    List<OrderItemDto> orderItems
) {}