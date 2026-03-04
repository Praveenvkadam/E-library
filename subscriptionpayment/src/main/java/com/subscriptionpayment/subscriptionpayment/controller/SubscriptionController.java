package com.subscriptionpayment.subscriptionpayment.controller;

import com.subscriptionpayment.subscriptionpayment.dto.PaymentVerificationDTO;
import com.subscriptionpayment.subscriptionpayment.dto.SubscriptionRequestDTO;
import com.subscriptionpayment.subscriptionpayment.dto.SubscriptionResponseDTO;
import com.subscriptionpayment.subscriptionpayment.service.RateLimitService;
import com.subscriptionpayment.subscriptionpayment.service.SubscriptionService;
import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;

@Slf4j
@RestController
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final RateLimitService    rateLimitService;


    @PostMapping("/initiate")
    public CompletableFuture<ResponseEntity<SubscriptionResponseDTO>> initiateSubscription(
            @Valid @RequestBody SubscriptionRequestDTO request,
            HttpServletRequest httpRequest
    ) {
        String ip = getClientIp(httpRequest);
        Bucket bucket = rateLimitService.resolveInitiateBucket(ip);

        if (!bucket.tryConsume(1)) {
            log.warn("Rate limit exceeded on /initiate | IP: {} | userId: {}", ip, request.getUserId());
            return CompletableFuture.completedFuture(
                    ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build()
            );
        }

        log.info("POST /initiate | userId: {} | plan: {} | IP: {}",
                request.getUserId(), request.getPlanType(), ip);

        return subscriptionService.initiateSubscription(request)
                .thenApply(ResponseEntity::ok);
    }

    // ================================================
    // ✅ Verify Payment
    // ================================================
    @PostMapping("/verify")
    public CompletableFuture<ResponseEntity<SubscriptionResponseDTO>> verifyPayment(
            @Valid @RequestBody PaymentVerificationDTO dto,
            HttpServletRequest httpRequest
    ) {
        String ip = getClientIp(httpRequest);
        Bucket bucket = rateLimitService.resolveVerifyBucket(ip);

        if (!bucket.tryConsume(1)) {
            log.warn("Rate limit exceeded on /verify | IP: {} | orderId: {}", ip, dto.getRazorpayOrderId());
            return CompletableFuture.completedFuture(
                    ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build()
            );
        }

        log.info("POST /verify | orderId: {} | IP: {}", dto.getRazorpayOrderId(), ip);

        return subscriptionService.verifyAndActivate(dto)
                .thenApply(ResponseEntity::ok);
    }

    // ================================================
    // ✅ Get Subscription by userId
    // ================================================
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getSubscription(
            @PathVariable String userId,
            HttpServletRequest httpRequest
    ) {
        String ip = getClientIp(httpRequest);
        Bucket bucket = rateLimitService.resolveGeneralBucket(ip);

        if (!bucket.tryConsume(1)) {
            log.warn("Rate limit exceeded on /user/{} | IP: {}", userId, ip);
            return ResponseEntity
                    .status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Too many requests — please slow down");
        }

        log.info("GET /user/{} | IP: {}", userId, ip);
        return ResponseEntity.ok(subscriptionService.getLatestSubscription(userId));
    }

    // ================================================
    // ✅ Health Check
    // ================================================
    @GetMapping("/health")
    public ResponseEntity<?> health(HttpServletRequest httpRequest) {
        Bucket bucket = rateLimitService.resolveGeneralBucket(getClientIp(httpRequest));

        if (!bucket.tryConsume(1)) {
            return ResponseEntity
                    .status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Too many requests — please slow down");
        }

        return ResponseEntity.ok("Subscription Service is UP ✓");
    }


    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}