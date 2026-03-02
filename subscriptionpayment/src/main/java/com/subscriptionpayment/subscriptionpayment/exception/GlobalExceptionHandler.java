package com.subscriptionpayment.subscriptionpayment.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {


    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() != null
                                ? fe.getDefaultMessage() : "Invalid value",
                        (a, b) -> a));

        Map<String, Object> body = buildErrorBody(
                HttpStatus.BAD_REQUEST, "Validation failed", fieldErrors.toString());

        return ResponseEntity.badRequest().body(body);
    }

    /** Handles domain-level subscription errors */
    @ExceptionHandler(SubscriptionException.class)
    public ResponseEntity<Map<String, Object>> handleSubscription(
            SubscriptionException ex) {
        log.warn("SubscriptionException: {}", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(buildErrorBody(HttpStatus.BAD_REQUEST, ex.getMessage(), null));
    }

    /** Catch-all for unexpected exceptions */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        log.error("Unexpected error: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildErrorBody(HttpStatus.INTERNAL_SERVER_ERROR,
                        "An unexpected error occurred", null));
    }

    private Map<String, Object> buildErrorBody(
            HttpStatus status, String message, String detail) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status",    status.value());
        body.put("error",     status.getReasonPhrase());
        body.put("message",   message);
        if (detail != null) body.put("detail", detail);
        return body;
    }
}