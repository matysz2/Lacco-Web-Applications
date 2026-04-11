package com.example.Lacco.model.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductDto(
    UUID id,                 // 1
    String kodProduktu,      // 2
    String grupa,            // 3
    String jm,               // 4
    String nazwa,            // 5
    BigDecimal opakowanie,   // 6
    BigDecimal ilosc,        // 7
    BigDecimal stanMinimalny,// 8
    BigDecimal cenaA,        // 9
    BigDecimal cenaB,        // 10
    BigDecimal cenaC,        // 11
    BigDecimal cenaProdukcji // 12
) {}