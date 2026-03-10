package com.BookUpload.BookUpload.Controller;

import com.BookUpload.BookUpload.DTO.BookRequest;
import com.BookUpload.BookUpload.DTO.BookResponce;
import com.BookUpload.BookUpload.Service.BookService;
import com.BookUpload.BookUpload.Service.RateLimitService;
import io.github.bucket4j.Bucket;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Date;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/books")
@Tag(name = "Books", description = "Book management endpoints")
public class BookController {

    @Autowired private BookService      bookService;
    @Autowired private RateLimitService rateLimitService;

    // =========================================================================
    // UPLOAD — POST /api/books/upload
    // =========================================================================
    @Operation(summary = "Upload a new book", description = "Admin only — uploads a book with cover image and PDF file")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Book uploaded successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid date format"),
            @ApiResponse(responseCode = "403", description = "Access denied — admins only"),
            @ApiResponse(responseCode = "429", description = "Too many requests"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadBook(
            @Parameter(description = "Book title")                    @RequestPart("bookName")        String B_name,
            @Parameter(description = "Book author")                   @RequestPart("bookAuthor")      String B_author,
            @Parameter(description = "Book description")              @RequestPart("bookDescription") String B_description,
            @Parameter(description = "Release date (yyyy-MM-dd)")     @RequestPart("releaseDate")     String releaseDate,
            @Parameter(description = "Book category")                 @RequestPart("bookCategory")    String B_Category,
            @Parameter(description = "Book language")                 @RequestPart("bookLanguage")    String B_Language,
            @Parameter(description = "Cover image file")              @RequestPart("imageFile")       MultipartFile imageFile,
            @Parameter(description = "PDF file")                      @RequestPart("pdfFile")         MultipartFile pdfFile,

            @RequestHeader(value = "X-User-Id",    required = false) String userId,
            @RequestHeader(value = "X-User-Email", required = false) String email,
            @RequestHeader(value = "X-User-Name",  required = false) String name,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            HttpServletRequest httpRequest
    ) {
        Bucket bucket = rateLimitService.resolveAdminBucket(getClientIp(httpRequest));
        if (!bucket.tryConsume(1)) {
            log.warn("Rate limit exceeded on /upload by IP: {}", getClientIp(httpRequest));
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Too many requests — please slow down");
        }

        log.info("Upload attempt by → name: {}, email: {}, roles: {}", name, email, roles);

        if (!hasRole(roles, "ROLE_ADMIN")) {
            log.warn("Unauthorized upload attempt by: {}", email);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied — only admins can upload books");
        }

        try {
            Date parsedDate = parseDate(releaseDate);
            BookRequest bookRequest = new BookRequest(
                    B_name, B_author, B_description,
                    null, null, parsedDate, B_Category, B_Language
            );
            BookResponce response = bookService.BookUpload(bookRequest, imageFile, pdfFile);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (DateTimeParseException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid date format. Expected yyyy-MM-dd");
        } catch (Exception e) {
            log.error("Upload failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Upload failed: " + e.getMessage());
        }
    }

    // =========================================================================
    // GET ALL — GET /api/books
    // =========================================================================
    @Operation(summary = "Get all books", description = "Returns a list of all available books")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Books retrieved successfully"),
            @ApiResponse(responseCode = "429", description = "Too many requests"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping
    public ResponseEntity<?> getAllBooks(HttpServletRequest httpRequest) {
        Bucket bucket = rateLimitService.resolvePublicBucket(getClientIp(httpRequest));
        if (!bucket.tryConsume(1)) {
            log.warn("Rate limit exceeded on /getAll by IP: {}", getClientIp(httpRequest));
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Too many requests — please slow down");
        }

        try {
            return ResponseEntity.ok(bookService.findAll());
        } catch (Exception e) {
            log.error("Failed to fetch books: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch books: " + e.getMessage());
        }
    }

    // =========================================================================
    // SEARCH — GET /api/books/search
    // =========================================================================
    @Operation(summary = "Search books", description = "Filter books by name, author, date, category, or language")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Search results returned"),
            @ApiResponse(responseCode = "429", description = "Too many requests"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/search")
    public ResponseEntity<?> searchBooks(
            @Parameter(description = "Book title")              @RequestParam(required = false) String B_name,
            @Parameter(description = "Author name")             @RequestParam(required = false) String B_author,
            @Parameter(description = "Release date (yyyy-MM-dd)")
            @RequestParam(required = false)
            @DateTimeFormat(pattern = "yyyy-MM-dd")             Date releaseDate,
            @Parameter(description = "Category")                @RequestParam(required = false) String B_Category,
            @Parameter(description = "Language")                @RequestParam(required = false) String B_Language,
            HttpServletRequest httpRequest
    ) {
        Bucket bucket = rateLimitService.resolvePublicBucket(getClientIp(httpRequest));
        if (!bucket.tryConsume(1)) {
            log.warn("Rate limit exceeded on /search by IP: {}", getClientIp(httpRequest));
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Too many requests — please slow down");
        }

        try {
            return ResponseEntity.ok(
                    bookService.searchBooks(B_name, B_author, releaseDate, B_Category, B_Language)
            );
        } catch (Exception e) {
            log.error("Search failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Search failed: " + e.getMessage());
        }
    }

    // =========================================================================
    // UPDATE — PUT /api/books/{id}
    // =========================================================================
    @Operation(summary = "Update a book", description = "Admin only — updates book details and optionally replaces files")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Book updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid date format"),
            @ApiResponse(responseCode = "403", description = "Access denied — admins only"),
            @ApiResponse(responseCode = "404", description = "Book not found"),
            @ApiResponse(responseCode = "429", description = "Too many requests"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateBook(
            @Parameter(description = "Book ID") @PathVariable Long id,
            @RequestPart("bookName")        String B_name,
            @RequestPart("bookAuthor")      String B_author,
            @RequestPart("bookDescription") String B_description,
            @RequestPart("releaseDate")     String releaseDate,
            @RequestPart("bookCategory")    String B_Category,
            @RequestPart("bookLanguage")    String B_Language,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile,
            @RequestPart(value = "pdfFile",   required = false) MultipartFile pdfFile,

            @RequestHeader(value = "X-User-Id",    required = false) String userId,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            HttpServletRequest httpRequest
    ) {
        Bucket bucket = rateLimitService.resolveAdminBucket(getClientIp(httpRequest));
        if (!bucket.tryConsume(1)) {
            log.warn("Rate limit exceeded on /update by IP: {}", getClientIp(httpRequest));
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Too many requests — please slow down");
        }

        log.info("Update attempt for bookId: {} by userId: {}", id, userId);

        if (!hasRole(roles, "ROLE_ADMIN")) {
            log.warn("Unauthorized update attempt by userId: {}", userId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied — only admins can update books");
        }

        try {
            Date parsedDate = parseDate(releaseDate);
            BookRequest bookRequest = new BookRequest(
                    B_name, B_author, B_description,
                    null, null, parsedDate, B_Category, B_Language
            );
            BookResponce response = bookService.BookUpdate(id, bookRequest, imageFile, pdfFile);
            return ResponseEntity.ok(response);

        } catch (DateTimeParseException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid date format. Expected yyyy-MM-dd");
        } catch (RuntimeException e) {
            log.error("Book not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Book not found with id: " + id);
        } catch (Exception e) {
            log.error("Update failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Update failed: " + e.getMessage());
        }
    }

    // =========================================================================
    // DELETE — DELETE /api/books/{id}
    // =========================================================================
    @Operation(summary = "Delete a book", description = "Admin only — permanently deletes a book by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Book deleted successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied — admins only"),
            @ApiResponse(responseCode = "404", description = "Book not found"),
            @ApiResponse(responseCode = "429", description = "Too many requests"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBook(
            @Parameter(description = "Book ID") @PathVariable Long id,
            @RequestHeader(value = "X-User-Id",    required = false) String userId,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            HttpServletRequest httpRequest
    ) {
        Bucket bucket = rateLimitService.resolveAdminBucket(getClientIp(httpRequest));
        if (!bucket.tryConsume(1)) {
            log.warn("Rate limit exceeded on /delete by IP: {}", getClientIp(httpRequest));
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Too many requests — please slow down");
        }

        log.info("Delete attempt for bookId: {} by userId: {}", id, userId);

        if (!hasRole(roles, "ROLE_ADMIN")) {
            log.warn("Unauthorized delete attempt by userId: {}", userId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied — only admins can delete books");
        }

        try {
            BookResponce response = bookService.BookDelete(id);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Book not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Book not found with id: " + id);
        } catch (Exception e) {
            log.error("Delete failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Delete failed: " + e.getMessage());
        }
    }

    // =========================================================================
    // HELPERS
    // =========================================================================
    private Date parseDate(String dateStr) {
        LocalDate localDate = LocalDate.parse(dateStr);
        return java.sql.Date.valueOf(localDate);
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }


    private boolean hasRole(String rolesHeader, String requiredRole) {
        if (rolesHeader == null || rolesHeader.isBlank()) return false;

        // Normalize requiredRole — strip "ROLE_" prefix for comparison
        // e.g. "ROLE_ADMIN" → "ADMIN"
        String normalizedRequired = requiredRole
                .replace("ROLE_", "")
                .trim()
                .toUpperCase();

        return List.of(rolesHeader.split(","))
                .stream()
                .map(String::trim)
                .map(role -> role.replace("ROLE_", "").toUpperCase()) // normalize incoming: "ROLE_ADMIN" or "ADMIN" → "ADMIN"
                .anyMatch(role -> role.equals(normalizedRequired));
    }
}