package com.user.UserProfile.Controller;

import com.user.UserProfile.DTO.ProfileRequestDTO;
import com.user.UserProfile.DTO.ProfileResponseDTO;
import com.user.UserProfile.RateLimit.RateLimitService;
import com.user.UserProfile.Service.ProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final RateLimitService rateLimitService;

    @PostMapping("/create")
    public ResponseEntity<?> createProfile(
            @RequestHeader("X-User-Id")                          String userId,
            @RequestHeader(value = "X-User-Email", defaultValue = "") String email,  // ✅ optional
            @RequestBody ProfileRequestDTO request) {

        if (!rateLimitService.isAllowed(userId, "create")) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Too many requests. Limit: 3/min. Try again later.");
        }

        // Use email from header if present, else fall back to request body email
        if (!email.isEmpty()) {
            request.setEmail(email);
        }

        log.info("Creating profile for userId: [{}] email: [{}]", userId, request.getEmail());
        ProfileResponseDTO response = profileService.createProfile(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(
            @RequestHeader("X-User-Id") String userId) {

        if (!rateLimitService.isAllowed(userId, "read")) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Too many requests. Limit: 30/min. Try again later.");
        }

        log.info("Fetching profile for userId: [{}]", userId);
        return ResponseEntity.ok(profileService.getProfileByUserId(userId));
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(
            @RequestHeader("X-User-Id")                           String userId,
            @RequestHeader(value = "X-User-Email", defaultValue = "") String email,  // ✅ optional
            @RequestBody ProfileRequestDTO request) {

        if (!rateLimitService.isAllowed(userId, "update")) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Too many requests. Limit: 5/min. Try again later.");
        }

        if (!email.isEmpty()) {
            request.setEmail(email);
        }

        log.info("Updating profile for userId: [{}]", userId);
        return ResponseEntity.ok(profileService.updateProfile(userId, request));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteProfile(
            @RequestHeader("X-User-Id") String userId) {

        if (!rateLimitService.isAllowed(userId, "delete")) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Too many requests. Limit: 2/min. Try again later.");
        }

        log.info("Deleting profile for userId: [{}]", userId);
        profileService.deleteProfile(userId);
        return ResponseEntity.ok("Profile deleted successfully.");
    }
}