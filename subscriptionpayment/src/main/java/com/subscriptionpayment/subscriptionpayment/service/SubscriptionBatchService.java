package com.subscriptionpayment.subscriptionpayment.service;

import com.subscriptionpayment.subscriptionpayment.model.Subscription;
import com.subscriptionpayment.subscriptionpayment.model.SubscriptionStatus;
import com.subscriptionpayment.subscriptionpayment.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionBatchService {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionService    subscriptionService;


    @Async("batchTaskExecutor")
    @Transactional
    public CompletableFuture<List<Long>> processExpiredSubscriptionsAsync(
            List<Subscription> expiredSubs) {

        log.info("[{}] Batch expiry started | count: {}",
                Thread.currentThread().getName(), expiredSubs.size());

        List<CompletableFuture<Long>> futures = expiredSubs.stream()
                .map(sub -> CompletableFuture
                        .supplyAsync(() -> expireSingle(sub))
                        .exceptionally(ex -> {
                            log.error("Failed to expire id: {} | {}",
                                    sub.getId(), ex.getMessage());
                            return -1L;
                        }))
                .collect(Collectors.toList());

        return CompletableFuture
                .allOf(futures.toArray(new CompletableFuture[0]))
                .thenApply(v -> futures.stream()
                        .map(CompletableFuture::join)
                        .filter(id -> id > 0)
                        .collect(Collectors.toList()))
                .thenApply(ids -> {
                    log.info("[{}] Batch expiry complete | expired: {} / {}",
                            Thread.currentThread().getName(), ids.size(), expiredSubs.size());
                    return ids;
                });
    }

    private Long expireSingle(Subscription sub) {
        sub.setStatus(SubscriptionStatus.EXPIRED);
        subscriptionRepository.save(sub);
        subscriptionService.sendExpiryNotificationAsync(sub);
        log.debug("[{}] Expired subscription id: {}",
                Thread.currentThread().getName(), sub.getId());
        return sub.getId();
    }
}
