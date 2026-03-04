package com.subscriptionpayment.subscriptionpayment.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private final Map<String, Bucket> initiateBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> verifyBuckets   = new ConcurrentHashMap<>();
    private final Map<String, Bucket> generalBuckets  = new ConcurrentHashMap<>();

    // Very strict: 3 req/min — initiate payment (prevents payment spam / duplicate orders)
    public Bucket resolveInitiateBucket(String ip) {
        return initiateBuckets.computeIfAbsent(ip, k ->
                Bucket.builder()
                        .addLimit(Bandwidth.classic(3, Refill.greedy(3, Duration.ofMinutes(1))))
                        .build()
        );
    }

    // Strict: 5 req/min — verify payment (prevents signature brute-force)
    public Bucket resolveVerifyBucket(String ip) {
        return verifyBuckets.computeIfAbsent(ip, k ->
                Bucket.builder()
                        .addLimit(Bandwidth.classic(5, Refill.greedy(5, Duration.ofMinutes(1))))
                        .build()
        );
    }

    // Lenient: 30 req/min — get subscription, health (read-only)
    public Bucket resolveGeneralBucket(String ip) {
        return generalBuckets.computeIfAbsent(ip, k ->
                Bucket.builder()
                        .addLimit(Bandwidth.classic(30, Refill.greedy(30, Duration.ofMinutes(1))))
                        .build()
        );
    }
}