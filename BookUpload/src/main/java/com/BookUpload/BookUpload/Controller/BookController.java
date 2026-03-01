package com.BookUpload.BookUpload.Controller;

import com.BookUpload.BookUpload.DTO.BookRequest;
import com.BookUpload.BookUpload.DTO.BookResponce;
import com.BookUpload.BookUpload.Service.BookService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookService bookService;

    // ================================================
    // ✅ ADMIN ONLY — Upload Book
    // ================================================
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadBook(
            @RequestPart("bookName")        String B_name,
            @RequestPart("bookAuthor")      String B_author,
            @RequestPart("bookDescription") String B_description,
            @RequestPart("releaseDate")     String releaseDate,
            @RequestPart("bookCategory")    String B_Category,
            @RequestPart("bookLanguage")    String B_Language,
            @RequestPart("imageFile")       MultipartFile imageFile,
            @RequestPart("pdfFile")         MultipartFile pdfFile,

            // ✅ Injected by API Gateway AuthFilter
            @RequestHeader("X-User-Id")    String userId,
            @RequestHeader("X-User-Email") String email,
            @RequestHeader("X-User-Name")  String name,
            @RequestHeader("X-User-Roles") String roles
    ) {
        log.info("Upload attempt by → name: {}, email: {}, roles: {}", name, email, roles);

        // ✅ Double check admin role
        if (!hasRole(roles, "ROLE_ADMIN")) {
            log.warn("Unauthorized upload attempt by: {}", email);
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Access denied — only admins can upload books");
        }

        try {
            Date parsedDate = new java.text.SimpleDateFormat("yyyy-MM-dd").parse(releaseDate);
            BookRequest bookRequest = new BookRequest(
                    B_name, B_author, B_description,
                    null, null,
                    parsedDate, B_Category, B_Language
            );
            BookResponce response = bookService.BookUpload(bookRequest, imageFile, pdfFile);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            log.error("Upload failed: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Upload failed: " + e.getMessage());
        }
    }

    // ================================================
    // ✅ PUBLIC — Get All Books
    // ================================================
    @GetMapping
    public ResponseEntity<?> getAllBooks() {
        try {
            List<BookResponce> books = bookService.findAll();
            return ResponseEntity.ok(books);
        } catch (Exception e) {
            log.error("Failed to fetch books: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch books: " + e.getMessage());
        }
    }

    // ================================================
    // ✅ PUBLIC — Search Books
    // ================================================
    @GetMapping("/search")
    public ResponseEntity<?> searchBooks(
            @RequestParam(required = false) String B_name,
            @RequestParam(required = false) String B_author,
            @RequestParam(required = false)
            @DateTimeFormat(pattern = "yyyy-MM-dd") Date releaseDate,
            @RequestParam(required = false) String B_Category,
            @RequestParam(required = false) String B_Language
    ) {
        try {
            List<BookResponce> books = bookService.searchBooks(
                    B_name, B_author, releaseDate, B_Category, B_Language
            );
            return ResponseEntity.ok(books);
        } catch (Exception e) {
            log.error("Search failed: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Search failed: " + e.getMessage());
        }
    }

    // ================================================
    // ✅ ADMIN ONLY — Update Book
    // ================================================
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateBook(
            @PathVariable Long id,
            @RequestPart("bookName")        String B_name,
            @RequestPart("bookAuthor")      String B_author,
            @RequestPart("bookDescription") String B_description,
            @RequestPart("releaseDate")     String releaseDate,
            @RequestPart("bookCategory")    String B_Category,
            @RequestPart("bookLanguage")    String B_Language,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile,
            @RequestPart(value = "pdfFile",   required = false) MultipartFile pdfFile,

            // ✅ Injected by API Gateway AuthFilter
            @RequestHeader("X-User-Id")    String userId,
            @RequestHeader("X-User-Roles") String roles
    ) {
        log.info("Update attempt for bookId: {} by userId: {}", id, userId);

        // ✅ Double check admin role
        if (!hasRole(roles, "ROLE_ADMIN")) {
            log.warn("Unauthorized update attempt by userId: {}", userId);
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Access denied — only admins can update books");
        }

        try {
            Date parsedDate = new java.text.SimpleDateFormat("yyyy-MM-dd").parse(releaseDate);
            BookRequest bookRequest = new BookRequest(
                    B_name, B_author, B_description,
                    null, null,
                    parsedDate, B_Category, B_Language
            );
            BookResponce response = bookService.BookUpdate(id, bookRequest, imageFile, pdfFile);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Book not found: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Book not found with id: " + id);
        } catch (Exception e) {
            log.error("Update failed: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Update failed: " + e.getMessage());
        }
    }

    // ================================================
    // ✅ ADMIN ONLY — Delete Book
    // ================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBook(
            @PathVariable Long id,

            // ✅ Injected by API Gateway AuthFilter
            @RequestHeader("X-User-Id")    String userId,
            @RequestHeader("X-User-Roles") String roles
    ) {
        log.info("Delete attempt for bookId: {} by userId: {}", id, userId);

        // ✅ Double check admin role
        if (!hasRole(roles, "ROLE_ADMIN")) {
            log.warn("Unauthorized delete attempt by userId: {}", userId);
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Access denied — only admins can delete books");
        }

        try {
            BookResponce response = bookService.BookDelete(id);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Book not found: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Book not found with id: " + id);
        } catch (Exception e) {
            log.error("Delete failed: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Delete failed: " + e.getMessage());
        }
    }

    // ================================================
    // ✅ Helper — Check role from X-User-Roles header
    // X-User-Roles value example: "ROLE_ADMIN,ROLE_USER"
    // ================================================
    private boolean hasRole(String rolesHeader, String requiredRole) {
        if (rolesHeader == null || rolesHeader.isEmpty()) return false;
        return List.of(rolesHeader.split(","))
                .stream()
                .map(String::trim)
                .anyMatch(role -> role.equals(requiredRole));
    }
}
//```
//
//        ---
//
//        ## What Changed From Your Original
//
//| | Before ❌ | After ✅ |
//        |---|---|---|
//        | Upload | No auth check | ROLE_ADMIN required |
//        | Update | No auth check | ROLE_ADMIN required |
//        | Delete | No auth check | ROLE_ADMIN required |
//        | Get All | No auth check | Public ✅ |
//        | Search | No auth check | Public ✅ |
//        | Return type | `ResponseEntity<BookResponce>` | `ResponseEntity<?>` (returns error messages too) |
//        | Error response | Empty body | Meaningful error message |
//        | Logging | None | `@Slf4j` logs all actions |
//
//        ---
//
//        ## Two Layers of Admin Protection
//```
//Request → /api/books/upload
//      ↓
//Gateway RoleFilter     → blocks if not ROLE_ADMIN ❌ (1st layer)
//        ↓
//        BookController.hasRole() → blocks if not ROLE_ADMIN ❌ (2nd layer)
//        ↓
//        BookServiceImp.BookUpload() → uploads to Cloudinary ✅