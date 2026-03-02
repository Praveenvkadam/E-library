package com.subscriptionpayment.subscriptionpayment.scheduler;

import com.subscriptionpayment.subscriptionpayment.model.Subscription;
import com.subscriptionpayment.subscriptionpayment.model.SubscriptionStatus;
import com.subscriptionpayment.subscriptionpayment.repository.SubscriptionRepository;
import com.subscriptionpayment.subscriptionpayment.service.SubscriptionBatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Component
@RequiredArgsConstructor
public class SubscriptionExpiryScheduler {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionBatchService batchService;


    @Scheduled(cron = "0 0 0 * * *")
    public void expireSubscriptions() {
        log.info("[{}] Expiry scheduler triggered at {}",
                Thread.currentThread().getName(), LocalDateTime.now());

        List<Subscription> toExpire = subscriptionRepository
                .findByStatusAndEndDateBefore(SubscriptionStatus.ACTIVE, LocalDateTime.now());

        if (toExpire.isEmpty()) {
            log.info("No subscriptions to expire.");
            return;
        }

        log.info("Found {} subscriptions to expire", toExpire.size());

        CompletableFuture<List<Long>> result =
                batchService.processExpiredSubscriptionsAsync(toExpire);

        // Non-blocking — scheduler thread returns immediately
        result.thenAccept(ids ->
                        log.info("Batch expiry finished | expiredIds: {}", ids))
                .exceptionally(ex -> {
                    log.error("Batch expiry encountered errors: {}", ex.getMessage());
                    return null;
                });
    }

    @Scheduled(fixedRate = 3_600_000)
    public void logActiveCount() {
        long count = subscriptionRepository.countByStatus(SubscriptionStatus.ACTIVE);
        log.info("[{}] Active subscriptions: {}",
                Thread.currentThread().getName(), count);
    }


    @Scheduled(fixedRate = 300_000)
    public void logStalePending() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(15);
        List<Subscription> stale = subscriptionRepository
                .findByStatusAndEndDateBefore(SubscriptionStatus.PENDING, threshold);
        if (!stale.isEmpty()) {
            log.warn("[{}] Stale PENDING subscriptions (>15 min): {}",
                    Thread.currentThread().getName(), stale.size());
        }
    }
}
