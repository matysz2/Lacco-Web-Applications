package com.example.Lacco.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Order entity representing an order in the system
 * Maps to 'zamowienia' table in the database
 */
@Entity
@Table(name = "zamowienia")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @Column(name = "id")
    private UUID id;

    @Column(name = "numer_zamowienia", nullable = false)
    private Integer numerZamowienia;

    @Column(name = "klient_id")
    private Integer klientId;

    @Column(name = "status")
    private String status;

    @Column(name = "suma_brutto")
    private BigDecimal sumaBrutto;

    @Column(name = "uwagi")
    private String uwagi;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "handlowiec_id")
    private UUID handlowiecId;

    @Column(name = "suma_netto")
    private BigDecimal sumaNetto;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> orderItems;
}