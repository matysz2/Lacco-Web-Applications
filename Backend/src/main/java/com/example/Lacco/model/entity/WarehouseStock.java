package com.example.Lacco.model.entity;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Entity
@Table(name = "stany_magazynowe")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseStock {
    @Id
    private UUID id;

    // TO JEST KLUCZOWE: Pole 'product' musi tu być, aby 'mappedBy' w Product działało
    @OneToOne
    @JoinColumn(name = "produkt_id") 
    private Product product;

    @Column(name = "ilosc_dostepna")
    private BigDecimal iloscDostepna;

    @Column(name = "stan_minimalny")
    private BigDecimal stanMinimalny;

    @Column(name = "last_update")
    private OffsetDateTime lastUpdate;
}