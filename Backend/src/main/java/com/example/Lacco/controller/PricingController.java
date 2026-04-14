package com.example.Lacco.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.Lacco.model.entity.CustomerPrice;
import com.example.Lacco.service.CustomerPriceService;

import java.util.List;

/**
 * Kontroler zarządzający cennikami w tabeli customer_price.
 * Zapewnia spójność danych między frontendem React a bazą SQL.
 */
@RestController
@RequestMapping("/api/customer-prices")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"})
public class PricingController {

    private final CustomerPriceService pricingService;

    // Pobranie wszystkich cen dla konkretnego klienta
    @GetMapping("/{customerId}")
    public ResponseEntity<List<CustomerPrice>> getPricesByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(pricingService.getAllByCustomer(customerId));
    }

    // Zapis lub aktualizacja ceny w customer_price
    @PostMapping("/save")
    public ResponseEntity<?> saveCustomerPrice(@RequestBody CustomerPrice request) {
        try {
            CustomerPrice saved = pricingService.saveWithMarginCheck(request);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            // Blokada, jeśli cena nie spełnia warunku koszt + 10%
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}