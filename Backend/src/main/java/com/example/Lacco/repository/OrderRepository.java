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

    @Query("SELECT SUM(o.sumaNetto) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt < :endDate")
    BigDecimal getTotalWeightInMonth(@Param("startDate") OffsetDateTime startDate, @Param("endDate") OffsetDateTime endDate);

    @Query("SELECT o.handlowiecId, SUM(o.sumaBrutto) FROM Order o GROUP BY o.handlowiecId ORDER BY SUM(o.sumaBrutto) DESC")
    List<Object[]> getSalesmanTotalSales();

    @Query("SELECT o.handlowiecId, SUM(o.sumaBrutto) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt < :endDate GROUP BY o.handlowiecId ORDER BY SUM(o.sumaBrutto) DESC")
    List<Object[]> getSalesmanSalesInMonth(@Param("startDate") OffsetDateTime startDate, @Param("endDate") OffsetDateTime endDate);
}