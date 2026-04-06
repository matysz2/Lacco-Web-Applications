package com.example.Lacco.controller;

import com.example.Lacco.model.dto.ProfileResponse;
import com.example.Lacco.service.SalesmanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for salesman endpoints
 */
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/salesmen")
@RequiredArgsConstructor
@Slf4j
public class SalesmanController {

    private final SalesmanService salesmanService;

    @GetMapping
    public ResponseEntity<List<ProfileResponse>> getAllSalesmen() {
        log.info("Fetching all salesmen");
        List<ProfileResponse> salesmen = salesmanService.getAllSalesmen();
        return ResponseEntity.ok(salesmen);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfileResponse> getSalesmanById(@PathVariable UUID id) {
        log.info("Fetching salesman with id: {}", id);
        ProfileResponse salesman = salesmanService.getSalesmanById(id);
        return ResponseEntity.ok(salesman);
    }

    @PostMapping
    public ResponseEntity<?> createSalesman(@RequestBody ProfileResponse profileResponse) {
        log.info("Creating new salesman: {}", profileResponse.firstName() + " " + profileResponse.lastName());
        try {
            ProfileResponse created = salesmanService.createSalesman(profileResponse);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains("duplicate") || 
                e.getCause() != null && e.getCause().getMessage() != null && e.getCause().getMessage().contains("duplicate")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse("Email już istnieje w systemie"));
            }
            log.error("Error creating salesman: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Błąd podczas tworzenia handlowca"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProfileResponse> updateSalesman(@PathVariable UUID id, @RequestBody ProfileResponse profileResponse) {
        log.info("Updating salesman with id: {}", id);
        ProfileResponse updated = salesmanService.updateSalesman(id, profileResponse);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSalesman(@PathVariable UUID id) {
        log.info("Deleting salesman with id: {}", id);
        salesmanService.deleteSalesman(id);
        return ResponseEntity.noContent().build();
    }

    private record ErrorResponse(String error) {}
}