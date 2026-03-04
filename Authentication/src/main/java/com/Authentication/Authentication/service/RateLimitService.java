package com.Authentication.Authentication.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    // Separate buckets per IP per endpoint type
    private final Map<String, Bucket> authBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> generalBuckets = new ConcurrentHashMap<>();

    // Strict: 5 requests per minute (for login/register/reset)
    public Bucket resolveAuthBucket(String ip) {
        return authBuckets.computeIfAbsent(ip, k ->
                Bucket.builder()
                        .addLimit(Bandwidth.classic(5, Refill.greedy(5, Duration.ofMinutes(1))))
                        .build()
        );
    }

    // Lenient: 30 requests per minute (for token validation, getAll)
    public Bucket resolveGeneralBucket(String ip) {
        return generalBuckets.computeIfAbsent(ip, k ->
                Bucket.builder()
                        .addLimit(Bandwidth.classic(30, Refill.greedy(30, Duration.ofMinutes(1))))
                        .build()
        );
    }
}