package com.Authentication.Authentication.repo;

import com.Authentication.Authentication.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.security.AuthProvider;
import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {
    Optional<User> findByUsernameOrEmail(String username, String email);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
