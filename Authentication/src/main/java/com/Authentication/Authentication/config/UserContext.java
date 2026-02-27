package com.Authentication.Authentication.config;

import lombok.Data;

@Data
public class UserContext {
    private String email;
    private String role;
    private String provider;
}