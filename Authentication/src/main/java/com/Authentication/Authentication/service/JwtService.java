package com.Authentication.Authentication.service;

import com.Authentication.Authentication.dto.TokenProcessResult;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${JWT_SECRET}")
    private String secretKey;

    @Value("${JWT_EXPIRATION_MS}")
    private Duration jwtExpirationInMs;

    public String generateToken(String email, String role) {
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationInMs.toMillis()))
                .signWith(getSigningKey())
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }


    public TokenProcessResult processToken(String token, UserDetails userDetails) {
        TokenProcessResult result = new TokenProcessResult();
        
        try {
            // Extract all claims from the token
            String username = extractUsername(token);
            String role = extractRole(token);
            Date expiration = extractExpiration(token);
            
            result.setUsername(username);
            result.setRole(role);
            result.setExpiration(expiration);
            result.setTokenExpired(isTokenExpired(token));
            
            // Validate token against userDetails if provided
            if (userDetails != null) {
                boolean isValid = username.equals(userDetails.getUsername()) && !isTokenExpired(token);
                result.setValid(isValid);
            } else {
                // Just check if token is expired
                result.setValid(!isTokenExpired(token));
            }
            
        } catch (Exception e) {
            result.setValid(false);
            result.setErrorMessage(e.getMessage());
        }
        
        return result;
    }


    public TokenProcessResult processToken(String token) {
        return processToken(token, null);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}