package com.example.Lacco.model.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO for Product entity
 */
public record ProductDto(
    UUID id,
    String kodProduktu,
    String grupa,
    String jm,
    String nazwa,
    BigDecimal opakowanie,
    BigDecimal cenaProdukcji,
    BigDecimal cenaA,
    BigDecimal cenaB,
    BigDecimal cenaC,
    OffsetDateTime createdAt
) {}