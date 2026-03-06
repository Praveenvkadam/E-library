package com.Authentication.Authentication.serviceIMP;

import com.Authentication.Authentication.dto.AuthResponse;
import com.Authentication.Authentication.dto.LoginRequest;
import com.Authentication.Authentication.dto.RegisterRequest;
import com.Authentication.Authentication.dto.RestPass;
import com.Authentication.Authentication.entity.Authprovider;
import com.Authentication.Authentication.entity.Role;
import com.Authentication.Authentication.entity.User;
import com.Authentication.Authentication.repo.UserRepo;
import com.Authentication.Authentication.service.CustomUserDetailsService;
import com.Authentication.Authentication.service.JwtService;
import com.Authentication.Authentication.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserSeviceImp implements UserService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    @Override
    public AuthResponse createUser(RegisterRequest request) {

        if (userRepo.existsByUsername(request.username())) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepo.existsByEmail(request.email())) {
            throw new RuntimeException("Email already registered");
        }

        boolean isFirstUser = userRepo.count() == 0;

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .provider(Authprovider.LOCAL)
                .role(isFirstUser ? Role.ADMIN : Role.USER)
                .build();

        userRepo.save(user);

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getProvider().name()   // "LOCAL"
        );

        return new AuthResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                token,
                user.getProvider().name()
        );
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        User user = userRepo
                .findByUsernameOrEmail(
                        request.usernameOrEmail(),
                        request.usernameOrEmail()
                )
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getProvider() != Authprovider.LOCAL) {
            throw new RuntimeException("Use Google login for this account");
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getProvider().name()   // "LOCAL"
        );

        return new AuthResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                token,
                user.getProvider().name()
        );
    }

    @Override
    public AuthResponse restpassword(RestPass restPass) {

        User user = userRepo.findByEmail(restPass.email())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getProvider() != Authprovider.LOCAL) {
            throw new RuntimeException("Password reset not allowed for Google accounts");
        }

        user.setPassword(passwordEncoder.encode(restPass.newPassword()));

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getProvider().name()   // "LOCAL"
        );

        return new AuthResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                token,
                user.getProvider().name()
        );
    }

    @Override
    public boolean isTokenValid(String token) {
        try {
            String email = jwtService.extractUsername(token);
            UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
            return jwtService.isTokenValid(token, userDetails);
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public AuthResponse processToken(String token) {

        String email = jwtService.extractUsername(token);
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);

        if (!jwtService.isTokenValid(token, userDetails)) {
            throw new RuntimeException("Invalid or expired token");
        }

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new AuthResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                token,
                user.getProvider().name()
        );
    }

    @Override
    public List<AuthResponse> getAllUsers() {
        return userRepo.findAll().stream()
                .map(user -> new AuthResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        null,
                        user.getProvider().name(),
                        user.getRole().name()
                ))
                .toList();
    }
}