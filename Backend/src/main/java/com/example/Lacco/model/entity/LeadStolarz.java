package com.example.Lacco.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "leady_stolarze", schema = "public")
@Getter 
@Setter
public class LeadStolarz {
    
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
    private String grupaCenowa;

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

    // Dodatkowe pola, o których wspomniałeś w SELECT:
    private String nawigacja; 
}