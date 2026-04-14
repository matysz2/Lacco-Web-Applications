package com.example.Lacco.repository;

import com.example.Lacco.model.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Product entity
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    @Query("SELECT p.cenaProdukcji FROM Product p WHERE p.id = :productId")
    Optional<BigDecimal> findProductionPriceById(@Param("productId") UUID productId);
}