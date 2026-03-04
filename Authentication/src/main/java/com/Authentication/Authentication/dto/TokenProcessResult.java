package com.Authentication.Authentication.dto;

import lombok.Data;
import java.util.Date;

@Data
public class TokenProcessResult {
    private String username;
    private String role;
    private String provider;      // ← add this
    private Date expiration;
    private boolean tokenExpired;
    private boolean valid;
    private String errorMessage;
}