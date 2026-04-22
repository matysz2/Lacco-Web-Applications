package com.example.Lacco.model.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record CustomerDto(
    Integer id,
    String nazwaFirmy,
    String telefon,
    String adres,
    String region,
    String handlowiec,
    LocalDate dataPozyskania,
    Boolean czyOdwiedzony,
    String statusWizyty,
    String opisNotatki,
    LocalDateTime dataOstatniejEdycji,
    String nawigacja,
    String stronaWww,
    Integer grupaCenowa,
    LocalDateTime ostatniaWizyta
) {}