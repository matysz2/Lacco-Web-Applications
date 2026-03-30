package com.example.Lacco.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Product entity representing a product in the warehouse
 * Maps to 'produkty' table in the database
 */
@Entity
@Table(name = "produkty")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @Column(name = "id")
    private UUID id;

    @Column(name = "kod_produktu", nullable = false)
    private String kodProduktu;

    @Column(name = "grupa")
    private String grupa;

    @Column(name = "jm")
    private String jm;

    @Column(name = "nazwa", nullable = false)
    private String nazwa;

    @Column(name = "opakowanie")
    private BigDecimal opakowanie;

    @Column(name = "cena_produkcji")
    private BigDecimal cenaProdukcji;

    @Column(name = "cena_a")
    private BigDecimal cenaA;

    @Column(name = "cena_b")
    private BigDecimal cenaB;

    @Column(name = "cena_c")
    private BigDecimal cenaC;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}