package com.example.Lacco.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import com.example.Lacco.model.entity.SalesGoal;

import jakarta.transaction.Transactional;

public interface SalesGoalRepository extends JpaRepository<SalesGoal, UUID> {
    Optional<SalesGoal> findByUserIdAndMonthDate(UUID userId, LocalDate monthDate);
    List<SalesGoal> findByUserId(UUID userId);
    List<SalesGoal> findByMonthDate(LocalDate monthDate);

    @Modifying
    @Transactional
    void deleteByUserId(UUID userId);

}
