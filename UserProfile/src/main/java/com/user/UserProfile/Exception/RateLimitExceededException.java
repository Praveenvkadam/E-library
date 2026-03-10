package com.user.UserProfile.Exception;

public class RateLimitExceededException extends RuntimeException {
    public RateLimitExceededException(String limit) {
        super("Too many requests. Limit: " + limit + ". Try again later.");
    }
}