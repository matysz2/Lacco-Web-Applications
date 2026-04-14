package com.example.Lacco.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "ceny_klientow")
@Getter
@Setter
public class CustomerPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "special_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal specialPrice;

    @Column(name = "color_id")
    private Integer colorId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    /**
     * Metoda pomocnicza do weryfikacji minimalnej ceny w serwisie przed zapisem.
     * Logika: cena_produkcji * 1.10 (koszt + 10% marży)
     */
    public boolean isValid(BigDecimal productionPrice) {
        if (productionPrice == null) return false;
        BigDecimal minAllowedPrice = productionPrice.multiply(new BigDecimal("1.10"));
        return this.specialPrice.compareTo(minAllowedPrice) >= 0;
    }
}