package com.user.UserProfile.Exception;

public class ProfileAlreadyExistsException extends RuntimeException {
    public ProfileAlreadyExistsException(String message) {  // ← was missing this
        super(message);
    }
}