package com.subscriptionpayment.subscriptionpayment.controller;

import com.subscriptionpayment.subscriptionpayment.dto.PaymentVerificationDTO;
import com.subscriptionpayment.subscriptionpayment.dto.SubscriptionRequestDTO;
import com.subscriptionpayment.subscriptionpayment.dto.SubscriptionResponseDTO;
import com.subscriptionpayment.subscriptionpayment.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.concurrent.CompletableFuture;

@Slf4j
@RestController
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;


    @PostMapping("/initiate")
    public CompletableFuture<ResponseEntity<SubscriptionResponseDTO>> initiateSubscription(
            @Valid @RequestBody SubscriptionRequestDTO request) {

        log.info("POST /initiate | userId: {} | plan: {}",
                request.getUserId(), request.getPlanType());

        return subscriptionService.initiateSubscription(request)
                .thenApply(ResponseEntity::ok);
    }


    @PostMapping("/verify")
    public CompletableFuture<ResponseEntity<SubscriptionResponseDTO>> verifyPayment(
            @Valid @RequestBody PaymentVerificationDTO dto) {

        log.info("POST /verify | orderId: {}", dto.getRazorpayOrderId());

        return subscriptionService.verifyAndActivate(dto)
                .thenApply(ResponseEntity::ok);
    }


    @GetMapping("/user/{userId}")
    public ResponseEntity<SubscriptionResponseDTO> getSubscription(
            @PathVariable String userId) {

        log.info("GET /user/{}", userId);
        return ResponseEntity.ok(subscriptionService.getLatestSubscription(userId));
    }


    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Subscription Service is UP ✓");
    }
}
