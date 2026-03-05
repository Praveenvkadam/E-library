package com.user.UserProfile.RateLimit;

import lombok.Getter;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Getter
public class RateLimitConfig {


    private final Map<String, Integer> limitPerMinute = Map.of(
            "create",  3,
            "read",    30,
            "update",  5,
            "delete",  2
    );
}