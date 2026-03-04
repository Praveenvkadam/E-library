package com.Mail.MailSevice.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private final Map<String, Bucket> passwordResetBuckets     = new ConcurrentHashMap<>();
    private final Map<String, Bucket> transactionalMailBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> notificationBuckets      = new ConcurrentHashMap<>();

    // Strictest: 3 req/10min — password reset (prevents reset link abuse)
    public Bucket resolvePasswordResetBucket(String ip) {
        return passwordResetBuckets.computeIfAbsent(ip, k ->
                Bucket.builder()
                        .addLimit(Bandwidth.classic(3, Refill.greedy(3, Duration.ofMinutes(10))))
                        .build()
        );
    }

    // Strict: 5 req/min — welcome, subscription (transactional, one-time events)
    public Bucket resolveTransactionalBucket(String ip) {
        return transactionalMailBuckets.computeIfAbsent(ip, k ->
                Bucket.builder()
                        .addLimit(Bandwidth.classic(5, Refill.greedy(5, Duration.ofMinutes(1))))
                        .build()
        );
    }

    // Moderate: 20 req/min — book notifications (bulk triggers from admin)
    public Bucket resolveNotificationBucket(String ip) {
        return notificationBuckets.computeIfAbsent(ip, k ->
                Bucket.builder()
                        .addLimit(Bandwidth.classic(20, Refill.greedy(20, Duration.ofMinutes(1))))
                        .build()
        );
    }
}