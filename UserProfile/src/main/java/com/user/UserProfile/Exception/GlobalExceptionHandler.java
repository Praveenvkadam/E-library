package com.user.UserProfile.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 400 — Missing X-User-Id or any required header
    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<?> handleMissingHeader(MissingRequestHeaderException ex) {
        return buildError(HttpStatus.BAD_REQUEST,
                "Required header '" + ex.getHeaderName() + "' is not present");
    }

    // 400 — @Valid failures on request body
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        f -> f.getField(),
                        f -> f.getDefaultMessage(),
                        (a, b) -> a
                ));
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now().toString());
        error.put("status",    400);
        error.put("error",     "Validation Failed");
        error.put("fields",    fieldErrors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // 400 — Bad argument
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException ex) {
        return buildError(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    // 404 — Profile not found
    @ExceptionHandler(ProfileNotFoundException.class)
    public ResponseEntity<?> handleProfileNotFound(ProfileNotFoundException ex) {
        return buildError(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    // 409 — Duplicate profile / bookmark / wishlist
    @ExceptionHandler(ProfileAlreadyExistsException.class)
    public ResponseEntity<?> handleProfileAlreadyExists(ProfileAlreadyExistsException ex) {
        return buildError(HttpStatus.CONFLICT, ex.getMessage());
    }

    // 429 — Rate limit exceeded
    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<?> handleRateLimit(RateLimitExceededException ex) {
        return buildError(HttpStatus.TOO_MANY_REQUESTS, ex.getMessage());
    }

    // 503 — BookUpload / Feign service down
    @ExceptionHandler(ServiceUnavailableException.class)
    public ResponseEntity<?> handleServiceUnavailable(ServiceUnavailableException ex) {
        return buildError(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage());
    }

    // 500 — Fallback
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGenericException(Exception ex) {
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR,
                "Something went wrong: " + ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> buildError(HttpStatus status, String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now().toString());
        error.put("status",    status.value());
        error.put("error",     status.getReasonPhrase());
        error.put("message",   message);
        return ResponseEntity.status(status).body(error);
    }
}