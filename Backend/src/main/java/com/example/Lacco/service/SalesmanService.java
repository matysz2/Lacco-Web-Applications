package com.example.Lacco.service;

import com.example.Lacco.model.dto.ProfileResponse;
import com.example.Lacco.model.entity.Profile;
import com.example.Lacco.model.entity.SalesGoal;
import com.example.Lacco.repository.ProfileRepository;
import com.example.Lacco.repository.SalesGoalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for handling salesman operations with integrated sales goals.
 * @author Mateusz
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SalesmanService {

    private final ProfileRepository profileRepository;
    private final SalesGoalRepository salesGoalRepository;
    private final EmailService emailService;

    public List<ProfileResponse> getAllSalesmen() {
        log.info("Fetching all traders with their current goals");
        return profileRepository.findByRole("TRADER").stream()
                .map(this::toDtoWithGoal)
                .collect(Collectors.toList());
    }

    public ProfileResponse getSalesmanById(UUID id) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salesman not found"));
        
        if (!"TRADER".equals(profile.getRole())) {
            throw new RuntimeException("Profile is not a salesman");
        }
        return toDtoWithGoal(profile);
    }

@Transactional
    public ProfileResponse createSalesman(ProfileResponse profileResponse) {
        log.info("Tworzenie nowego profilu handlowca dla email: {}", profileResponse.email());
        
        Profile profile = toEntity(profileResponse);
        profile.setId(UUID.randomUUID());
        profile.setRole("TRADER");
        profile.setCreatedAt(OffsetDateTime.now());
        profile.setUpdatedAt(OffsetDateTime.now());
        profile.setIsActive(true);

        String token = UUID.randomUUID().toString();
        profile.setPasswordResetToken(token);
        profile.setTokenExpiry(OffsetDateTime.now().plusHours(24));
        
        // 1. NAJPIERW ZAPISZ PROFIL - bez tego updateMonthlyGoal rzuci błąd klucza obcego
        Profile saved = profileRepository.save(profile);

        // 2. POTEM DODAJ CEL - metoda updateMonthlyGoal musi wykonać się po zapisie profilu
        if (profileResponse.currentMonthGoal() != null) {
            updateMonthlyGoal(saved.getId(), profileResponse.currentMonthGoal());
        }

        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(saved.getEmail(), resetLink);

        return toDtoWithGoal(saved);
    }

    @Transactional
    public ProfileResponse updateSalesman(UUID id, ProfileResponse profileResponse) {
        log.info("Aktualizacja profilu i celów dla ID: {}", id);
        
        Profile existing = profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salesman not found"));

        if (!"TRADER".equals(existing.getRole())) {
            throw new RuntimeException("Profile is not a salesman");
        }

        existing.setFirstName(profileResponse.firstName());
        existing.setLastName(profileResponse.lastName());
        existing.setEmail(profileResponse.email());
        existing.setUpdatedAt(OffsetDateTime.now());
        
        // 1. NAJPIERW ZAPISZ PROFIL
        Profile saved = profileRepository.save(existing);

        // 2. POTEM AKTUALIZUJ CEL
        if (profileResponse.currentMonthGoal() != null) {
            updateMonthlyGoal(id, profileResponse.currentMonthGoal());
        }

        return toDtoWithGoal(saved);
    }

    @Transactional
    public void deleteSalesman(UUID id) {
        log.warn("Usuwanie handlowca i powiązanych danych dla ID: {}", id);
        
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salesman not found"));
        
        if (!"TRADER".equals(profile.getRole())) {
            throw new RuntimeException("Profile is not a salesman");
        }

        // 1. NAJPIERW USUŃ CELE - musisz to zrobić przed usunięciem profilu
        // Upewnij się, że salesGoalRepository ma metodę deleteByUserId
        salesGoalRepository.deleteByUserId(id);

        // 2. NA KOŃCU USUŃ PROFIL
        profileRepository.deleteById(id);
    }

    public ProfileResponse getCurrentProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Profile profile = profileRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono profilu dla zalogowanego użytkownika"));
        return toDtoWithGoal(profile);
    }

    // --- HELPER METHODS ---

    private void updateMonthlyGoal(UUID userId, BigDecimal amount) {
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        
        SalesGoal goal = salesGoalRepository.findByUserIdAndMonthDate(userId, startOfMonth)
                .orElse(SalesGoal.builder()
                        .userId(userId)
                        .monthDate(startOfMonth)
                        .volumeGoal(BigDecimal.ZERO)
                        .build());

        goal.setFinancialGoal(amount);
        salesGoalRepository.save(goal);
        log.info("Financial goal for user {} set to {}", userId, amount);
    }

    private ProfileResponse toDtoWithGoal(Profile profile) {
        LocalDate currentMonth = LocalDate.now().withDayOfMonth(1);
        BigDecimal currentGoal = salesGoalRepository.findByUserIdAndMonthDate(profile.getId(), currentMonth)
                .map(SalesGoal::getFinancialGoal)
                .orElse(BigDecimal.ZERO);

        return new ProfileResponse(
                profile.getId(),
                profile.getFirstName(),
                profile.getLastName(),
                profile.getEmail(),
                profile.getRole(),
                profile.getCreatedAt(),
                profile.getIsActive(),
                profile.getLastLogin(),
                profile.getUpdatedAt(),
                currentGoal // Przekazujemy cel do DTO
        );
    }

    private Profile toEntity(ProfileResponse dto) {
        return Profile.builder()
                .id(dto.id())
                .firstName(dto.firstName())
                .lastName(dto.lastName())
                .email(dto.email())
                .role(dto.role())
                .build();
    }
}