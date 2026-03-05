package com.user.UserProfile.Repository;

import com.user.UserProfile.Entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, String> {
    Optional<Profile> findByEmail(String email);
    boolean existsByUserId(String userId);
}