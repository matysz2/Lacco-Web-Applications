package com.example.Lacco.service;

import com.example.Lacco.model.entity.CustomerPrice;
import com.example.Lacco.repository.CustomerPriceRepository;
import com.example.Lacco.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerPriceService {

    private final CustomerPriceRepository customerPriceRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<CustomerPrice> getAllByCustomer(Long customerId) {
        return customerPriceRepository.findByCustomerId(customerId);
    }

    @Transactional
    public CustomerPrice saveWithMarginCheck(CustomerPrice newPrice) {
        // Pobieramy koszt z poprawionej metody repozytorium
        BigDecimal productionCost = productRepository.findProductionPriceById(newPrice.getProductId())
                .orElseThrow(() -> new RuntimeException("Produkt nie istnieje w bazie: " + newPrice.getProductId()));

        // Walidacja marży (Twoja metoda isValid z encji)
        if (!newPrice.isValid(productionCost)) {
            BigDecimal minPrice = productionCost.multiply(new BigDecimal("1.10"));
            throw new IllegalArgumentException(
                "Marża zbyt niska! Minimalna cena sprzedaży dla tego lakieru to: " + minPrice + " PLN"
            );
        }

        // Logika "Upsert" (Update or Insert)
        return customerPriceRepository.findByCustomerIdAndProductId(newPrice.getCustomerId(), newPrice.getProductId())
                .map(existingPrice -> {
                    existingPrice.setSpecialPrice(newPrice.getSpecialPrice());
                    existingPrice.setColorId(newPrice.getColorId());
                    return customerPriceRepository.save(existingPrice);
                })
                .orElseGet(() -> customerPriceRepository.save(newPrice));
    }

    @Transactional
    public void deleteSpecialPrice(Long id) {
        customerPriceRepository.deleteById(id);
    }
}