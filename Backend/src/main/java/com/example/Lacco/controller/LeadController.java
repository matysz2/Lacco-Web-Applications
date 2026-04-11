package com.example.Lacco.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.Lacco.model.entity.LeadStolarz;
import com.example.Lacco.repository.LeadRepository;


@RestController
@RequestMapping("/api/leads")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"})
public class LeadController {

    @Autowired
    private LeadRepository repository;

@GetMapping
public ResponseEntity<?> getLeads(
        @RequestParam(required = false) String handlowiec, 
        @RequestParam(required = false, defaultValue = "") String search) {
    try {
        String hName = (handlowiec == null || handlowiec.isEmpty()) ? "Mateusz" : handlowiec;
        List<LeadStolarz> leads;

        if (!search.isEmpty()) {
            leads = repository.findByHandlowiecAndNazwaFirmyContainingIgnoreCase(hName, search);
        } else {
            leads = repository.findByHandlowiec(hName);
        }
        return ResponseEntity.ok(leads);
    } catch (Exception e) {
        // To wypisze konkretny błąd w logach Dockera (np. brak kolumny)
        e.printStackTrace(); 
        return ResponseEntity.status(500).body("Błąd bazy: " + e.getMessage());
    }
}// <--- SPRAWDŹ CZY TEN NAWIAS TU JEST

@DeleteMapping("/{id}")
public void deleteLead(@PathVariable Long id) { // Zmieniono @RequestParam na @PathVariable
    repository.deleteById(id);
}
@PutMapping("/{id}")
public ResponseEntity<?> updateLead(@PathVariable Long id, @RequestBody LeadStolarz updatedData) {
    return repository.findById(id)
        .map(lead -> {
            lead.setNazwaFirmy(updatedData.getNazwaFirmy());
            lead.setAdres(updatedData.getAdres());
            lead.setStatusWizyty(updatedData.getStatusWizyty());
            lead.setOpisNotatki(updatedData.getOpisNotatki());
            
            // Ważne: aktualizujemy datę edycji przed zapisem
            lead.setDataOstatniejEdycji(LocalDateTime.now());
            
            return ResponseEntity.ok(repository.save(lead));
        })
        .orElse(ResponseEntity.notFound().build());
}
@PostMapping
public ResponseEntity<LeadStolarz> addLead(@RequestBody LeadStolarz newLead) {
    // Ustawiamy datę pozyskania na teraz
    newLead.setDataPozyskania(LocalDateTime.now());
    newLead.setDataOstatniejEdycji(LocalDateTime.now());
    
    LeadStolarz savedLead = repository.save(newLead);
    return ResponseEntity.ok(savedLead);
}

}
