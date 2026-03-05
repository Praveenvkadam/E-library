package com.user.UserProfile.RateLimit;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class RateLimitService {

    private final RateLimitConfig config;

    // Key: "userId:operation" → [requestCount, windowStartEpochSecond]
    private final Map<String, long[]> requestTracker = new ConcurrentHashMap<>();

    private static final long WINDOW_SECONDS = 60L; // 1 minute window

    public boolean isAllowed(String userId, String operation) {
        int maxRequests = config.getLimitPerMinute()
                .getOrDefault(operation, 10); // fallback: 10/min

        String key = userId + ":" + operation;
        long now = Instant.now().getEpochSecond();

        requestTracker.compute(key, (k, val) -> {
            if (val == null || (now - val[1]) >= WINDOW_SECONDS) {
                return new long[]{1, now}; // reset window
            }
            val[0]++;
            return val;
        });

        long[] current = requestTracker.get(key);
        return current[0] <= maxRequests;
    }
}