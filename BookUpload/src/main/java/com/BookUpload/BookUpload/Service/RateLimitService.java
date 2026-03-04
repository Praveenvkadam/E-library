package com.BookUpload.BookUpload.Service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private final Map<String, Bucket> adminBuckets  = new ConcurrentHashMap<>();
    private final Map<String, Bucket> publicBuckets = new ConcurrentHashMap<>();

    // Strict: 10 req/min — upload, update, delete (admin writes)
    public Bucket resolveAdminBucket(String ip) {
        return adminBuckets.computeIfAbsent(ip, k ->
                Bucket.builder()
                        .addLimit(Bandwidth.classic(10, Refill.greedy(10, Duration.ofMinutes(1))))
                        .build()
        );
    }

    // Lenient: 60 req/min — getAll, search (public reads)
    public Bucket resolvePublicBucket(String ip) {
        return publicBuckets.computeIfAbsent(ip, k ->
                Bucket.builder()
                        .addLimit(Bandwidth.classic(60, Refill.greedy(60, Duration.ofMinutes(1))))
                        .build()
        );
    }
}