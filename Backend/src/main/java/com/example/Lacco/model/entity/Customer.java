package com.example.Lacco.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Customer entity representing a customer in the system
 * Maps to 'leady_stolarze' table in the database
 */
@Entity
@Table(name = "leady_stolarze")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private Integer id;

    @Column(name = "nazwa_firmy", nullable = false)
    private String nazwaFirmy;

    @Column(name = "telefon")
    private String telefon;

    @Column(name = "adres")
    private String adres;

    @Column(name = "region")
    private String region;

    @Column(name = "handlowiec")
    private java.util.UUID handlowiec;

    @Column(name = "data_pozyskania")
    private LocalDate dataPozyskania;

    @Column(name = "czy_odwiedzony")
    private Boolean czyOdwiedzony;

    @Column(name = "status_wizyty")
    private String statusWizyty;

    @Column(name = "opis_notatki")
    private String opisNotatki;

    @Column(name = "data_ostatniej_edycji")
    private OffsetDateTime dataOstatniejEdycji;

    @Column(name = "nawigacja")
    private String nawigacja;

    @Column(name = "strona_www")
    private String stronaWww;

    @Column(name = "grupa_cenowa")
    private Integer grupaCenowa;

    @Column(name = "ostatnia_wizyta")
    private OffsetDateTime ostatniaWizyta;
}