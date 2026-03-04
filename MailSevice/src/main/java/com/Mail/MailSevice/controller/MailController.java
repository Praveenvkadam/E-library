package com.Mail.MailSevice.controller;

import com.Mail.MailSevice.dto.MailRequestDto;
import com.Mail.MailSevice.dto.MailResponseDto;
import com.Mail.MailSevice.service.MailService;
import com.Mail.MailSevice.service.RateLimitService;
import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/mail")
@RequiredArgsConstructor
public class MailController {

    private final MailService      mailService;
    private final RateLimitService rateLimitService;

    // ================================================
    // ✅ Welcome Mail
    // ================================================
    @PostMapping("/welcome")
    public ResponseEntity<MailResponseDto> sendWelcome(
            @Valid @RequestBody MailRequestDto request,
            HttpServletRequest httpRequest
    ) {
        String ip = getClientIp(httpRequest);
        Bucket bucket = rateLimitService.resolveTransactionalBucket(ip);

        if (!bucket.tryConsume(1)) {
            log.warn("Rate limit exceeded on /welcome | IP: {} | to: {}", ip, request.to());
            return ResponseEntity
                    .status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(MailResponseDto.failure("Too many requests — please slow down"));
        }

        log.info("POST /welcome | to: {} | IP: {}", request.to(), ip);
        return ResponseEntity.ok(mailService.sendWelcomeMail(request));
    }

    // ================================================
    // ✅ Subscription Mail
    // ================================================
    @PostMapping("/subscription")
    public ResponseEntity<MailResponseDto> sendSubscription(
            @Valid @RequestBody MailRequestDto request,
            HttpServletRequest httpRequest
    ) {
        String ip = getClientIp(httpRequest);
        Bucket bucket = rateLimitService.resolveTransactionalBucket(ip);

        if (!bucket.tryConsume(1)) {
            log.warn("Rate limit exceeded on /subscription | IP: {} | to: {}", ip, request.to());
            return ResponseEntity
                    .status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(MailResponseDto.failure("Too many requests — please slow down"));
        }

        log.info("POST /subscription | to: {} | IP: {}", request.to(), ip);
        return ResponseEntity.ok(mailService.sendSubscriptionMail(request));
    }

    // ================================================
    // ✅ Book Notification Mail
    // ================================================
    @PostMapping("/book-notification")
    public ResponseEntity<MailResponseDto> sendBookNotification(
            @Valid @RequestBody MailRequestDto request,
            HttpServletRequest httpRequest
    ) {
        String ip = getClientIp(httpRequest);
        Bucket bucket = rateLimitService.resolveNotificationBucket(ip);

        if (!bucket.tryConsume(1)) {
            log.warn("Rate limit exceeded on /book-notification | IP: {} | to: {}", ip, request.to());
            return ResponseEntity
                    .status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(MailResponseDto.failure("Too many requests — please slow down"));
        }

        log.info("POST /book-notification | to: {} | IP: {}", request.to(), ip);
        return ResponseEntity.ok(mailService.sendBookUploadNotification(request));
    }

    // ================================================
    // ✅ Password Reset Mail — STRICTEST
    // ================================================
    @PostMapping("/password-reset")
    public ResponseEntity<MailResponseDto> sendPasswordReset(
            @Valid @RequestBody MailRequestDto request,
            HttpServletRequest httpRequest
    ) {
        String ip = getClientIp(httpRequest);
        Bucket bucket = rateLimitService.resolvePasswordResetBucket(ip);

        if (!bucket.tryConsume(1)) {
            log.warn("Rate limit exceeded on /password-reset | IP: {} | to: {}", ip, request.to());
            return ResponseEntity
                    .status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(MailResponseDto.failure("Too many requests — please slow down"));
        }

        log.info("POST /password-reset | to: {} | IP: {}", request.to(), ip);
        return ResponseEntity.ok(mailService.sendPasswordResetMail(request));
    }


    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}