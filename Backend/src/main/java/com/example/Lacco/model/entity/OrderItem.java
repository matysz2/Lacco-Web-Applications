package com.example.Lacco.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * OrderItem entity representing an item in an order
 * Maps to 'pozycje_zamowienia' table in the database
 */

/**
 * OrderItem entity representing an item in an order
 * Maps to 'pozycje_zamowienia' table in the database
 */
@Entity
@Table(name = "pozycje_zamowienia")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zamowienie_id")
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produkt_id", insertable = false, updatable = false)
    private Product produkt;

    @Column(name = "produkt_id")
    private UUID produktId;

    @Column(name = "ilosc", nullable = false)
    private BigDecimal ilosc;

    @Column(name = "cena_zastosowana", nullable = false)
    private BigDecimal cenaZastosowana;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "wartosc_netto")
    private BigDecimal wartoscNetto;

    @Column(name = "nazwa")
    private String nazwa;

    @Column(name = "opakowanie")
    private String opakowanie;

    @Column(name = "kolor_id")
    private Integer kolorId;

    /**
     * Pobiera kod bezpośrednio z powiązanej encji Produkt.
     * Zapobiega NullPointerException przy braku powiązania.
     */
    public String getKodProduktu() {
        return (produkt != null) ? produkt.getKodProduktu() : "BRAK KODU";
    }

    /**
     * Zwraca nazwę produktu z momentu złożenia zamówienia.
     */
    public String getNazwaProduktu() {
        return this.nazwa;
    }
}