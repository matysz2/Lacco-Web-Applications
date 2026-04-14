package com.example.Lacco.repository;

import com.example.Lacco.model.entity.CustomerPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerPriceRepository extends JpaRepository<CustomerPrice, Long> {
    
    // Pobiera historię cen dla konkretnego klienta
    List<CustomerPrice> findByCustomerId(Long customerId);
    
    // Znajduje cenę dla pary: klient + produkt
    Optional<CustomerPrice> findByCustomerIdAndProductId(Long customerId, UUID productId);
}