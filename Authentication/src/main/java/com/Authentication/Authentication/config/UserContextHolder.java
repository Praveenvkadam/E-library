package com.Authentication.Authentication.config;


public class UserContextHolder {

    private static final ThreadLocal<UserContext> context = new ThreadLocal<>();

    public static void set(UserContext userContext) {
        context.set(userContext);
    }

    public static UserContext get() {
        return context.get();
    }

    public static void clear() {
        context.remove();
    }
}