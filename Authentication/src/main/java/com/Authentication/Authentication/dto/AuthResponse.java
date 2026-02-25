package com.Authentication.Authentication.dto;

public record AuthResponse(
        Long userId,
        String username,
        String email,
        String role,
        String token,
        String provider
) {
}
