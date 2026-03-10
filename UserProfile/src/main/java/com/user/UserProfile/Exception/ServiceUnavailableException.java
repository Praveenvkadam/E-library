package com.user.UserProfile.Exception;

public class ServiceUnavailableException extends RuntimeException {
    public ServiceUnavailableException(String service) {
        super(service + " is currently unavailable. Please try again later.");
    }
}