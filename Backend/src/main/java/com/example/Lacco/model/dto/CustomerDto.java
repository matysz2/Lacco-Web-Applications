package com.example.Lacco.model.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO for Customer entity
 */
public record CustomerDto(
    Integer id,
    String nazwaFirmy,
    String telefon,
    String adres,
    String region,
    UUID handlowiec,
    LocalDate dataPozyskania,
    Boolean czyOdwiedzony,
    String statusWizyty,
    String opisNotatki,
    OffsetDateTime dataOstatniejEdycji,
    String nawigacja,
    String stronaWww,
    Integer grupaCenowa,
    OffsetDateTime ostatniaWizyta
) {}