package com.user.UserProfile.Controller;

import com.user.UserProfile.DTO.*;
import com.user.UserProfile.Exception.RateLimitExceededException;
import com.user.UserProfile.RateLimit.RateLimitService;
import com.user.UserProfile.Service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "Manage user profiles, reading history, bookmarks and wishlist")
public class ProfileController {

    private final ProfileService   profileService;
    private final RateLimitService rateLimitService;

    // ── Profile CRUD ──────────────────────────────────────────────

    @Operation(summary = "Create a new user profile")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Profile created"),
            @ApiResponse(responseCode = "400", description = "Validation failed / missing header"),
            @ApiResponse(responseCode = "409", description = "Profile already exists"),
            @ApiResponse(responseCode = "429", description = "Too many requests")
    })
    @PostMapping("/create")
    public ResponseEntity<?> createProfile(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") String userId,
            @Parameter(hidden = true) @RequestHeader(value = "X-User-Email", defaultValue = "") String email,
            @Valid @RequestBody ProfileRequestDTO request) {

        if (!rateLimitService.isAllowed(userId, "create")) {
            throw new RateLimitExceededException("3/min");
        }

        if (!email.isEmpty()) request.setEmail(email);

        log.info("📝 Creating profile → userId: [{}]", userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(profileService.createProfile(userId, request));
    }

    @Operation(summary = "Get current user profile")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Profile found"),
            @ApiResponse(responseCode = "404", description = "Profile not found"),
            @ApiResponse(responseCode = "429", description = "Too many requests")
    })
    @GetMapping("/me")
    public ResponseEntity<?> getProfile(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") String userId) {

        if (!rateLimitService.isAllowed(userId, "read")) {
            throw new RateLimitExceededException("30/min");
        }

        log.info("🔍 Fetching profile → userId: [{}]", userId);
        return ResponseEntity.ok(profileService.getProfileByUserId(userId));
    }

    @Operation(summary = "Update current user profile")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Profile updated"),
            @ApiResponse(responseCode = "400", description = "Validation failed"),
            @ApiResponse(responseCode = "404", description = "Profile not found"),
            @ApiResponse(responseCode = "429", description = "Too many requests")
    })
    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") String userId,
            @Parameter(hidden = true) @RequestHeader(value = "X-User-Email", defaultValue = "") String email,
            @Valid @RequestBody ProfileRequestDTO request) {

        if (!rateLimitService.isAllowed(userId, "update")) {
            throw new RateLimitExceededException("5/min");
        }

        if (!email.isEmpty()) request.setEmail(email);

        log.info("✏️ Updating profile → userId: [{}]", userId);
        return ResponseEntity.ok(profileService.updateProfile(userId, request));
    }

    @Operation(summary = "Delete current user profile")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Profile deleted"),
            @ApiResponse(responseCode = "404", description = "Profile not found"),
            @ApiResponse(responseCode = "429", description = "Too many requests")
    })
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteProfile(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") String userId) {

        if (!rateLimitService.isAllowed(userId, "delete")) {
            throw new RateLimitExceededException("2/min");
        }

        log.info("🗑️ Deleting profile → userId: [{}]", userId);
        profileService.deleteProfile(userId);
        return ResponseEntity.ok("Profile deleted successfully.");
    }

    // ── Reading History ───────────────────────────────────────────

    @Operation(summary = "Get reading history with progress")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reading history returned"),
            @ApiResponse(responseCode = "404", description = "Profile not found"),
            @ApiResponse(responseCode = "429", description = "Too many requests")
    })
    @GetMapping("/me/reading-history")
    public ResponseEntity<List<ProfileResponseDTO.ReadingHistoryDTO>> getReadingHistory(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") String userId) {

        if (!rateLimitService.isAllowed(userId, "read")) {
            throw new RateLimitExceededException("30/min");
        }

        log.info("📚 Fetching reading history → userId: [{}]", userId);
        return ResponseEntity.ok(profileService.getReadingHistory(userId));
    }

    @Operation(summary = "Update reading progress for a book")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Progress updated"),
            @ApiResponse(responseCode = "400", description = "Validation failed"),
            @ApiResponse(responseCode = "404", description = "Profile not found"),
            @ApiResponse(responseCode = "429", description = "Too many requests")
    })
    @PatchMapping("/me/reading-progress")
    public ResponseEntity<Void> updateReadingProgress(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody ReadingProgressUpdateDTO dto) {

        if (!rateLimitService.isAllowed(userId, "update")) {
            throw new RateLimitExceededException("5/min");
        }

        log.info("📖 Updating progress → userId: [{}] bookId: [{}] progress: [{}%]",
                userId, dto.getBookId(), dto.getProgressPercent());
        profileService.updateReadingProgress(userId, dto);
        return ResponseEntity.noContent().build();
    }

    // ── Bookmarks ─────────────────────────────────────────────────

    @Operation(summary = "Get all bookmarks")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Bookmarks returned"),
            @ApiResponse(responseCode = "404", description = "Profile not found"),
            @ApiResponse(responseCode = "429", description = "Too many requests")
    })
    @GetMapping("/me/bookmarks")
    public ResponseEntity<List<BookmarkResponseDTO>> getBookmarks(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") String userId) {

        if (!rateLimitService.isAllowed(userId, "read")) {
            throw new RateLimitExceededException("30/min");
        }

        log.info("🔖 Fetching bookmarks → userId: [{}]", userId);
        return ResponseEntity.ok(profileService.getBookmarks(userId));
    }

    @Operation(summary = "Add a bookmark")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Bookmark added"),
            @ApiResponse(responseCode = "409", description = "Bookmark already exists"),
            @ApiResponse(responseCode = "429", description = "Too many requests")
    })
    @PostMapping("/me/bookmarks")
    public ResponseEntity<BookmarkResponseDTO> addBookmark(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") String userId,
            @RequestParam                        String  bookId,
            @RequestParam(required = false)      Integer page,
            @RequestParam(required = false)      String  note) {

        if (!rateLimitService.isAllowed(userId, "create")) {
            throw new RateLimitExceededException("3/min");
        }

        log.info("🔖 Adding bookmark → userId: [{}] bookId: [{}] page: [{}]", userId, bookId, page);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(profileService.addBookmark(userId, bookId, page, note));
    }

    @Operation(summary = "Remove a bookmark")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Bookmark removed"),
            @ApiResponse(responseCode = "404", description = "Bookmark not found"),
            @ApiResponse(responseCode = "429", description = "Too many requests")
    })
    @DeleteMapping("/me/bookmarks/{bookmarkId}")
    public ResponseEntity<Void> removeBookmark(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") String userId,
            @PathVariable String bookmarkId) {

        if (!rateLimitService.isAllowed(userId, "delete")) {
            throw new RateLimitExceededException("2/min");
        }

        log.info("🗑️ Removing bookmark → userId: [{}] bookmarkId: [{}]", userId, bookmarkId);
        profileService.removeBookmark(userId, bookmarkId);
        return ResponseEntity.noContent().build();
    }

    // ── Wishlist ──────────────────────────────────────────────────

    @Operation(summary = "Get wishlist")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Wishlist returned"),
            @ApiResponse(responseCode = "404", description = "Profile not found"),
            @ApiResponse(responseCode = "429", description = "Too many requests")
    })
    @GetMapping("/me/wishlist")
    public ResponseEntity<List<WishlistItemDTO>> getWishlist(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") String userId) {

        if (!rateLimitService.isAllowed(userId, "read")) {
            throw new RateLimitExceededException("30/min");
        }

        log.info("❤️ Fetching wishlist → userId: [{}]", userId);
        return ResponseEntity.ok(profileService.getWishlist(userId));
    }

    @Operation(summary = "Add book to wishlist")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Added to wishlist"),
            @ApiResponse(responseCode = "409", description = "Already in wishlist"),
            @ApiResponse(responseCode = "429", description = "Too many requests")
    })
    @PostMapping("/me/wishlist")
    public ResponseEntity<WishlistItemDTO> addToWishlist(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody WishlistRequestDTO dto) {

        if (!rateLimitService.isAllowed(userId, "create")) {
            throw new RateLimitExceededException("3/min");
        }

        log.info("❤️ Adding to wishlist → userId: [{}] bookId: [{}]", userId, dto.getBookId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(profileService.addToWishlist(userId, dto.getBookId()));
    }

    @Operation(summary = "Remove book from wishlist")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Removed from wishlist"),
            @ApiResponse(responseCode = "404", description = "Wishlist item not found"),
            @ApiResponse(responseCode = "429", description = "Too many requests")
    })
    @DeleteMapping("/me/wishlist/{wishlistItemId}")
    public ResponseEntity<Void> removeFromWishlist(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") String userId,
            @PathVariable String wishlistItemId) {

        if (!rateLimitService.isAllowed(userId, "delete")) {
            throw new RateLimitExceededException("2/min");
        }

        log.info("🗑️ Removing wishlist item → userId: [{}] itemId: [{}]", userId, wishlistItemId);
        profileService.removeFromWishlist(userId, wishlistItemId);
        return ResponseEntity.noContent().build();
    }
}