package com.Authentication.Authentication.controller;


import com.Authentication.Authentication.dto.AuthResponse;
import com.Authentication.Authentication.dto.LoginRequest;
import com.Authentication.Authentication.dto.RegisterRequest;
import com.Authentication.Authentication.dto.RestPass;
import com.Authentication.Authentication.service.RateLimitService;
import com.Authentication.Authentication.service.UserService;
import io.github.bucket4j.Bucket;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication and authorization endpoints")
public class UserController {

    private final UserService userService;
    private final RateLimitService rateLimitService;

    @Operation(summary = "Register a new user")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User registered successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid registration data"),
            @ApiResponse(responseCode = "429", description = "Too many requests")
    })
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest
    ) {
        Bucket bucket = rateLimitService.resolveAuthBucket(getClientIp(httpRequest));
        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
        }
        return ResponseEntity.ok(userService.createUser(request));
    }

    @Operation(summary = "Login user and return JWT")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login successful"),
            @ApiResponse(responseCode = "401", description = "Invalid credentials"),
            @ApiResponse(responseCode = "429", description = "Too many requests")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest
    ) {
        Bucket bucket = rateLimitService.resolveAuthBucket(getClientIp(httpRequest));
        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
        }
        return ResponseEntity.ok(userService.login(request));
    }

    @Operation(summary = "Reset user password")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Password reset successful"),
            @ApiResponse(responseCode = "400", description = "Invalid reset request"),
            @ApiResponse(responseCode = "429", description = "Too many requests")
    })
    @PostMapping("/restpass")
    public ResponseEntity<String> resetPassword(
            @Valid @RequestBody RestPass request,
            HttpServletRequest httpRequest
    ) {
        Bucket bucket = rateLimitService.resolveAuthBucket(getClientIp(httpRequest));
        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
        }
        userService.restpassword(request);
        return ResponseEntity.ok("Password reset successful");
    }

    @Operation(summary = "Validate JWT token")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Token validity returned"),
            @ApiResponse(responseCode = "429", description = "Too many requests")
    })
    // ✅ FIX: explicit name in @PathVariable("token")
    @GetMapping("/valid/{token}")
    public ResponseEntity<Boolean> validateToken(
            @PathVariable("token") String token,
            HttpServletRequest httpRequest
    ) {
        Bucket bucket = rateLimitService.resolveGeneralBucket(getClientIp(httpRequest));
        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
        }
        return ResponseEntity.ok(userService.isTokenValid(token));
    }

    @Operation(summary = "Process token action")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Token processed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid or expired token"),
            @ApiResponse(responseCode = "429", description = "Too many requests")
    })
    // ✅ FIX: explicit name in @PathVariable("token")
    @GetMapping("/{token}")
    public ResponseEntity<AuthResponse> handleToken(
            @PathVariable("token") String token,
            HttpServletRequest httpRequest
    ) {
        Bucket bucket = rateLimitService.resolveGeneralBucket(getClientIp(httpRequest));
        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
        }
        return ResponseEntity.ok(userService.processToken(token));
    }

    @GetMapping("/getall")
    public ResponseEntity<List<AuthResponse>> getAllUsers(HttpServletRequest httpRequest) {
        Bucket bucket = rateLimitService.resolveGeneralBucket(getClientIp(httpRequest));
        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
        }
        return ResponseEntity.ok(userService.getAllUsers());
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}