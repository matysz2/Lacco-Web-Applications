package com.example.Lacco.service;

import com.example.Lacco.model.dto.ProfileResponse;
import com.example.Lacco.model.entity.Profile;
import com.example.Lacco.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for handling salesman operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SalesmanService {

    private final ProfileRepository profileRepository;

    public List<ProfileResponse> getAllSalesmen() {
        return profileRepository.findByRole("HANDLOWIEC").stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ProfileResponse getSalesmanById(UUID id) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salesman not found"));
        if (!"HANDLOWIEC".equals(profile.getRole())) {
            throw new RuntimeException("Profile is not a salesman");
        }
        return toDto(profile);
    }

    public ProfileResponse createSalesman(ProfileResponse profileResponse) {
        Profile profile = toEntity(profileResponse);
        profile.setId(UUID.randomUUID());
        profile.setRole("HANDLOWIEC");
        profile.setCreatedAt(OffsetDateTime.now());
        profile.setUpdatedAt(OffsetDateTime.now());
        profile.setIsActive(true);
        Profile saved = profileRepository.save(profile);
        return toDto(saved);
    }

    public ProfileResponse updateSalesman(UUID id, ProfileResponse profileResponse) {
        Profile existing = profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salesman not found"));
        if (!"HANDLOWIEC".equals(existing.getRole())) {
            throw new RuntimeException("Profile is not a salesman");
        }
        existing.setFirstName(profileResponse.firstName());
        existing.setLastName(profileResponse.lastName());
        existing.setEmail(profileResponse.email());
        existing.setUpdatedAt(OffsetDateTime.now());
        Profile saved = profileRepository.save(existing);
        return toDto(saved);
    }

    public void deleteSalesman(UUID id) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salesman not found"));
        if (!"HANDLOWIEC".equals(profile.getRole())) {
            throw new RuntimeException("Profile is not a salesman");
        }
        profileRepository.deleteById(id);
    }

    private ProfileResponse toDto(Profile profile) {
        return new ProfileResponse(
                profile.getId(),
                profile.getFirstName(),
                profile.getLastName(),
                profile.getEmail(),
                profile.getRole(),
                profile.getCreatedAt(),
                profile.getIsActive(),
                profile.getLastLogin(),
                profile.getUpdatedAt()
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