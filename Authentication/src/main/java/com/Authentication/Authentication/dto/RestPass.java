package com.Authentication.Authentication.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RestPass(
        @NotBlank
        String email,
        @NotBlank
        @Size(min = 6, message = "Password must be at least 6 characters")
        String newPassword
) {
}
