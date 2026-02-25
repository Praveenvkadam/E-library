package com.Authentication.Authentication.controller;

import com.Authentication.Authentication.dto.AuthResponse;
import com.Authentication.Authentication.dto.LoginRequest;
import com.Authentication.Authentication.dto.RegisterRequest;
import com.Authentication.Authentication.dto.RestPass;
import com.Authentication.Authentication.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication and authorization endpoints")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Register a new user")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User registered successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid registration data")
    })
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    @Operation(summary = "Login user and return JWT")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login successful"),
            @ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(userService.login(request));
    }

    @Operation(summary = "Reset user password")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Password reset successful"),
            @ApiResponse(responseCode = "400", description = "Invalid reset request")
    })
    @PostMapping("/restpass")
    public ResponseEntity<String> resetPassword(
            @Valid @RequestBody RestPass request
    ) {
        userService.restpassword(request);
        return ResponseEntity.ok("Password reset successful");
    }

    @Operation(summary = "Validate JWT token")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Token validity returned")
    })
    @GetMapping("/valid/{token}")
    public ResponseEntity<Boolean> validateToken(
            @PathVariable String token
    ) {
        return ResponseEntity.ok(userService.isTokenValid(token));
    }

    @Operation(summary = "Process token action")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Token processed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid or expired token")
    })

    @GetMapping("/{token}")
    public ResponseEntity<AuthResponse> handleToken(
            @PathVariable String token
    ) {
        return ResponseEntity.ok(userService.processToken(token));
    }
}