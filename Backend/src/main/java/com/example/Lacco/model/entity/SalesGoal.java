package com.example.Lacco.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@NoArgsConstructor // Tego brakuje i to wywala błąd!
@AllArgsConstructor
@Data
@Entity
@Builder
@Table(name = "sales_goals", schema = "public")
public class SalesGoal {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "financial_goal")
    private BigDecimal financialGoal;

    @Column(name = "volume_goal")
    private BigDecimal volumeGoal;

    @Column(name = "month_date")
    private LocalDate monthDate;
}