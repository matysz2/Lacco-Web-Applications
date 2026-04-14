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
    Integer numerZamowienia,
    Integer klientId,
    String status,
    BigDecimal sumaBrutto,
    String uwagi,
    OffsetDateTime createdAt,
    UUID handlowiecId,
    BigDecimal sumaNetto,
    List<OrderItemDto> orderItems,
    String nazwaFirmy // <--- To pole pozwoli wyświetlić stolarza w tabeli
) {}