package com.subscriptionpayment.subscriptionpayment.service;

import com.subscriptionpayment.subscriptionpayment.dto.PaymentVerificationDTO;
import com.subscriptionpayment.subscriptionpayment.dto.SubscriptionRequestDTO;
import com.subscriptionpayment.subscriptionpayment.dto.SubscriptionResponseDTO;
import com.subscriptionpayment.subscriptionpayment.exception.SubscriptionException;
import com.subscriptionpayment.subscriptionpayment.kafka.SubscriptionEventProducer;
import com.subscriptionpayment.subscriptionpayment.model.Subscription;
import com.subscriptionpayment.subscriptionpayment.model.SubscriptionStatus;
import com.subscriptionpayment.subscriptionpayment.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final RazorpayService         razorpayService;
    private final SubscriptionEventProducer eventProducer;


    @Transactional
    public CompletableFuture<SubscriptionResponseDTO> initiateSubscription(
            SubscriptionRequestDTO request) {

        log.info("[{}] Initiating subscription | userId: {} | plan: {}",
                Thread.currentThread().getName(),
                request.getUserId(), request.getPlanType());

        return razorpayService.createOrderAsync(request.getPlanType())
                .thenApply(orderId -> {
                    Subscription sub = Subscription.builder()
                            .userId(request.getUserId())
                            .planType(request.getPlanType().toUpperCase())
                            .status(SubscriptionStatus.PENDING)
                            .razorpayOrderId(orderId)
                            .build();

                    Subscription saved = subscriptionRepository.save(sub);

                    log.info("[{}] Subscription persisted | id: {} | orderId: {}",
                            Thread.currentThread().getName(), saved.getId(), orderId);

                    return mapToResponse(saved);
                })
                .exceptionally(ex -> {
                    log.error("Initiation failed for userId: {} | {}",
                            request.getUserId(), ex.getMessage());
                    throw new SubscriptionException(
                            "Subscription initiation failed: " + ex.getMessage());
                });
    }


    @Transactional
    public CompletableFuture<SubscriptionResponseDTO> verifyAndActivate(
            PaymentVerificationDTO dto) {

        log.info("[{}] Verifying payment | orderId: {}",
                Thread.currentThread().getName(), dto.getRazorpayOrderId());

        Subscription subscription = subscriptionRepository
                .findByRazorpayOrderId(dto.getRazorpayOrderId())
                .orElseThrow(() -> new SubscriptionException(
                        "No subscription found for orderId: " + dto.getRazorpayOrderId()));

        return razorpayService.verifySignatureAsync(
                        dto.getRazorpayOrderId(),
                        dto.getRazorpayPaymentId(),
                        dto.getRazorpaySignature())

                .thenCompose(isValid -> {
                    if (!isValid) {
                        subscription.setStatus(SubscriptionStatus.FAILED);
                        subscriptionRepository.save(subscription);
                        CompletableFuture<SubscriptionResponseDTO> f = new CompletableFuture<>();
                        f.completeExceptionally(
                                new SubscriptionException("Payment signature verification failed"));
                        return f;
                    }

                    LocalDateTime now = LocalDateTime.now();
                    subscription.setStatus(SubscriptionStatus.ACTIVE);
                    subscription.setRazorpayPaymentId(dto.getRazorpayPaymentId());
                    subscription.setStartDate(now);
                    subscription.setEndDate(
                            "YEARLY".equalsIgnoreCase(subscription.getPlanType())
                                    ? now.plusYears(1)
                                    : now.plusMonths(1));

                    Subscription activated = subscriptionRepository.save(subscription);

                    // Kafka event — fire-and-forget, doesn't block response
                    eventProducer.publishSubscriptionActivatedAsync(activated);

                    log.info("[{}] Subscription ACTIVATED | id: {} | userId: {} | until: {}",
                            Thread.currentThread().getName(),
                            activated.getId(),
                            activated.getUserId(),
                            activated.getEndDate());

                    return CompletableFuture.completedFuture(mapToResponse(activated));
                })
                .exceptionally(ex -> {
                    log.error("Activation failed | orderId: {} | {}",
                            dto.getRazorpayOrderId(), ex.getMessage());
                    throw new SubscriptionException(ex.getMessage());
                });
    }


    public SubscriptionResponseDTO getLatestSubscription(String userId) {
        Subscription sub = subscriptionRepository
                .findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new SubscriptionException(
                        "No subscription found for userId: " + userId));
        return mapToResponse(sub);
    }


    @Async("subscriptionTaskExecutor")
    public void sendExpiryNotificationAsync(Subscription subscription) {
        log.info("[{}] Sending expiry notification | userId: {}",
                Thread.currentThread().getName(), subscription.getUserId());
        // TODO: call notification-service via Feign client
    }


    private SubscriptionResponseDTO mapToResponse(Subscription s) {
        LocalDateTime now = LocalDateTime.now();
        boolean isActive  = s.getStatus() == SubscriptionStatus.ACTIVE
                && s.getEndDate() != null
                && s.getEndDate().isAfter(now);
        long daysRemaining = (isActive && s.getEndDate() != null)
                ? ChronoUnit.DAYS.between(now, s.getEndDate())
                : 0L;

        return SubscriptionResponseDTO.builder()
                .subscriptionId(s.getId())
                .userId(s.getUserId())
                .planType(s.getPlanType())
                .status(s.getStatus())
                .razorpayOrderId(s.getRazorpayOrderId())
                .razorpayPaymentId(s.getRazorpayPaymentId())
                .startDate(s.getStartDate())
                .endDate(s.getEndDate())
                .createdAt(s.getCreatedAt())
                .isActive(isActive)
                .daysRemaining(daysRemaining)
                .build();
    }
}
