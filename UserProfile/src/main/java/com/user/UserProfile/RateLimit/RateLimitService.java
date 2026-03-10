package com.user.UserProfile.RateLimit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class RateLimitService {

    @Value("${rate-limit.create:3}")
    private int createLimit;

    @Value("${rate-limit.read:30}")
    private int readLimit;

    @Value("${rate-limit.update:5}")
    private int updateLimit;

    @Value("${rate-limit.delete:2}")
    private int deleteLimit;

    // key: userId:operation:minuteBucket → count
    private final Map<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();

    public boolean isAllowed(String userId, String operation) {
        String key = userId + ":" + operation + ":" + getCurrentMinuteBucket();
        AtomicInteger count = requestCounts.computeIfAbsent(key, k -> new AtomicInteger(0));
        int current = count.incrementAndGet();
        return current <= getLimit(operation);
    }

    private int getLimit(String operation) {
        return switch (operation) {
            case "create" -> createLimit;
            case "read"   -> readLimit;
            case "update" -> updateLimit;
            case "delete" -> deleteLimit;
            default       -> 10;
        };
    }

    private long getCurrentMinuteBucket() {
        return System.currentTimeMillis() / 60_000;
    }
}