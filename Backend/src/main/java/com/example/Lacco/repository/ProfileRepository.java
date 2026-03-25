package com.example.Lacco.repository;

import com.example.Lacco.model.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Profile entity
 */
@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {
    /**
     * Find profile by email
     */
    Optional<Profile> findByEmail(String email);
}
