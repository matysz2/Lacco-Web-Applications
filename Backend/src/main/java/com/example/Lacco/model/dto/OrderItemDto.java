package com.example.Lacco.model.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO for OrderItem entity
 * Dostosowane do wymagań widoku sprzedaży i metod mapujących w serwisie.
 */
public record OrderItemDto(
    UUID id,
    String kodProduktu,      // Dodane dla frontendu
    String nazwaProduktu,    // Zmienione z 'nazwa' dla jasności
    BigDecimal ilosc,
    String opakowanie,       // String, aby obsłużyć jednostki (np. "5L", "szt")
    BigDecimal cenaZastosowana,
    BigDecimal wartoscNetto,
    UUID produktId,          // Przeniesione na koniec (opcjonalne w widoku)
    OffsetDateTime createdAt,
    Integer kolorId
) {
    // Konstruktor pomocniczy dla serwisu (7 parametrów), którego używasz w toOrderItemDto
    public OrderItemDto(
            UUID id, 
            String kodProduktu, 
            String nazwaProduktu, 
            BigDecimal ilosc, 
            String opakowanie, 
            BigDecimal cenaZastosowana, 
            BigDecimal wartoscNetto) {
        this(id, kodProduktu, nazwaProduktu, ilosc, opakowanie, cenaZastosowana, wartoscNetto, null, null, null);
    }
}