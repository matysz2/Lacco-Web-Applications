package com.example.Lacco.repository;

import com.example.Lacco.model.entity.LeadStolarz;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LeadRepository extends JpaRepository<LeadStolarz, Long> {

    // Filtrowanie po handlowcu (podstawa widoku)
    List<LeadStolarz> findByHandlowiec(String handlowiec);

    // Filtrowanie po handlowcu i nazwie firmy (dla wyszukiwarki)
    List<LeadStolarz> findByHandlowiecAndNazwaFirmyContainingIgnoreCase(String handlowiec, String nazwaFirmy);
}