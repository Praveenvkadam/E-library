package com.BookUpload.BookUpload.Service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Service
public class RateLimitService {

    // FIX: Caffeine cache auto-evicts idle IPs after 1 hour
    //      Prevents unbounded memory growth from unique/bot IPs
    private final Cache<String, Bucket> adminBuckets = Caffeine.newBuilder()
            .expireAfterAccess(1, TimeUnit.HOURS)
            .maximumSize(5_000)
            .build();

    private final Cache<String, Bucket> publicBuckets = Caffeine.newBuilder()
            .expireAfterAccess(1, TimeUnit.HOURS)
            .maximumSize(10_000)
            .build();

    // Strict: 10 req/min — upload, update, delete (admin writes)
    public Bucket resolveAdminBucket(String ip) {
        return adminBuckets.get(ip, k ->
                Bucket.builder()
                        .addLimit(Bandwidth.classic(10, Refill.greedy(10, Duration.ofMinutes(1))))
                        .build()
        );
    }

    // Lenient: 60 req/min — getAll, search (public reads)
    public Bucket resolvePublicBucket(String ip) {
        return publicBuckets.get(ip, k ->
                Bucket.builder()
                        .addLimit(Bandwidth.classic(60, Refill.greedy(60, Duration.ofMinutes(1))))
                        .build()
        );
    }
}