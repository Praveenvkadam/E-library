package com.Authentication.Authentication.controller;

import com.Authentication.Authentication.dto.AuthResponse;
import com.Authentication.Authentication.dto.LoginRequest;
import com.Authentication.Authentication.dto.RegisterRequest;
import com.Authentication.Authentication.dto.RestPass;
import com.Authentication.Authentication.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest registerRequest
    ){
        return ResponseEntity.ok(userService.createUser(registerRequest));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest loginRequest
            ) {
        return ResponseEntity.ok(userService.login(loginRequest));
    }

    @PostMapping("/restpass")
    public ResponseEntity<String> restPass(
            @Valid @RequestBody RestPass restPass
    ) {
        userService.restpassword(restPass);
        return ResponseEntity.ok("Password reset successful");
    }

    @GetMapping("/valid/{token}")
    public ResponseEntity<Boolean> validateToken(
            @PathVariable String token
    ) {
        boolean isValid = userService.isTokenValid(token);
        return ResponseEntity.ok(isValid);
    }

    @GetMapping("/{token}")
    public ResponseEntity<String> handleToken(
            @PathVariable String token
    ) {
        userService.processToken(token);
        return ResponseEntity.ok("Token processed successfully");
    }

}
