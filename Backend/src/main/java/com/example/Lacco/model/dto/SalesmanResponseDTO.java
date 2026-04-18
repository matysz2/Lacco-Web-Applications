package com.example.Lacco.model.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class SalesmanResponseDTO {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private BigDecimal currentFinancialGoal;
    private BigDecimal previousFinancialGoal;
}