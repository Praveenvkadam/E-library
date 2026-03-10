package com.user.UserProfile.Exception;

public class ProfileAlreadyExistsException extends RuntimeException {
    public ProfileAlreadyExistsException(String message) { super(message); }
}