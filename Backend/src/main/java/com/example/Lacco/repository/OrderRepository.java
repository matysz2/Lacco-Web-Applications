package com.example.Lacco.repository;

import com.example.Lacco.model.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository for Order entity
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    List<Order> findByStatus(String status);

    @Query("SELECT o FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt < :endDate")
    List<Order> findOrdersInMonth(@Param("startDate") OffsetDateTime startDate, @Param("endDate") OffsetDateTime endDate);

    @Query("SELECT SUM(o.sumaBrutto) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt < :endDate")
    BigDecimal getTotalSalesInMonth(@Param("startDate") OffsetDateTime startDate, @Param("endDate") OffsetDateTime endDate);

    @Query("SELECT MAX(o.numerZamowienia) FROM Order o")
    Integer findMaxOrderNumber();

    @Query("SELECT p.firstName, p.lastName, SUM(o.sumaBrutto) FROM Order o JOIN Profile p ON o.handlowiecId = p.id GROUP BY o.handlowiecId ORDER BY SUM(o.sumaBrutto) DESC")
    List<Object[]> getSalesmanTotalSales();

    @Query("SELECT p.firstName, p.lastName, SUM(o.sumaBrutto) FROM Order o JOIN Profile p ON o.handlowiecId = p.id WHERE o.createdAt >= :startDate AND o.createdAt < :endDate GROUP BY o.handlowiecId ORDER BY SUM(o.sumaBrutto) DESC")
    List<Object[]> getSalesmanSalesInMonth(@Param("startDate") OffsetDateTime startDate, @Param("endDate") OffsetDateTime endDate);

    @Query("SELECT SUM(oi.ilosc) FROM OrderItem oi JOIN oi.order o WHERE o.createdAt >= :startDate AND o.createdAt < :endDate")
    BigDecimal getTotalWeightInMonth(@Param("startDate") OffsetDateTime startDate, @Param("endDate") OffsetDateTime endDate);

    // Trader stats methods
    @Query("SELECT SUM(o.sumaNetto) FROM Order o WHERE o.handlowiecId = :handlowiecId")
    BigDecimal getTotalSalesForTrader(@Param("handlowiecId") UUID handlowiecId);

    @Query("SELECT SUM(o.sumaNetto) FROM Order o WHERE o.handlowiecId = :handlowiecId AND o.createdAt >= :startDate AND o.createdAt < :endDate")
    BigDecimal getMonthlySalesForTrader(@Param("handlowiecId") UUID handlowiecId, @Param("startDate") OffsetDateTime startDate, @Param("endDate") OffsetDateTime endDate);

    @Query("SELECT c.nazwaFirmy, SUM(o.sumaNetto) FROM Order o JOIN Customer c ON o.klientId = c.id WHERE o.handlowiecId = :handlowiecId GROUP BY o.klientId ORDER BY SUM(o.sumaNetto) DESC LIMIT 1")
    List<Object[]> getTopClientForTrader(@Param("handlowiecId") UUID handlowiecId);

    @Query("SELECT oi.produktId, SUM(oi.ilosc) FROM OrderItem oi JOIN oi.order o WHERE o.handlowiecId = :handlowiecId GROUP BY oi.produktId ORDER BY SUM(oi.ilosc) DESC LIMIT 1")
    List<Object[]> getTopProductForTrader(@Param("handlowiecId") UUID handlowiecId);
}