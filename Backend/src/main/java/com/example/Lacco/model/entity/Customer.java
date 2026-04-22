package com.example.Lacco.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

/**
 * Customer entity representing a customer in the system
 * Maps to 'leady_stolarze' table in the database
 */
@Entity
@Table(name = "leady_stolarze", schema = "public")
@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "nazwa_firmy")
    private String nazwaFirmy;

    private String adres;

    private String telefon;

    @Column(name = "strona_www")
    private String stronaWww;
    
    private String region;

    
    @Column(name = "grupa_cenowa")
    private Integer grupaCenowa;

    private String handlowiec;

    @Column(name = "status_wizyty")
    private String statusWizyty;

    @Column(name = "opis_notatki")
    private String opisNotatki;

    @Column(name = "czy_odwiedzony")
    private Boolean czyOdwiedzony;

    @Column(name = "data_pozyskania")
    private LocalDateTime dataPozyskania;

    @Column(name = "data_ostatniej_edycji")
    private LocalDateTime dataOstatniejEdycji;

    @Column(name = "ostatnia_wizyta")
    private LocalDateTime ostatniaWizyta;

@Column(columnDefinition = "text")
    private String nawigacja; 
}