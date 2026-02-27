package com.Authentication.Authentication.service;

import com.Authentication.Authentication.dto.TokenProcessResult;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Slf4j
@Service
public class JwtService {

    @Value("${JWT_SECRET}")
    private String secretKey;

    @Value("${JWT_EXPIRATION_MS}")
    private long jwtExpirationInMs;

    private SecretKey signingKey;

    @PostConstruct
    public void init() {
        this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey));
    }

    // ─── Generate ────────────────────────────────────────────────────────────────

    public String generateToken(String email, String role, String provider) {
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .claim("provider", provider)
                .claim("type", "access")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationInMs))
                .signWith(signingKey)
                .compact();
    }

    // ─── Extract ─────────────────────────────────────────────────────────────────

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public String extractProvider(String token) {
        return extractClaim(token, claims -> claims.get("provider", String.class));
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        return claimsResolver.apply(extractAllClaims(token));
    }

    // ─── Validate ────────────────────────────────────────────────────────────────

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            String username = extractUsername(token);
            String type = extractClaim(token, claims -> claims.get("type", String.class));
            return username.equals(userDetails.getUsername())
                    && !isTokenExpired(token)
                    && "access".equals(type);
        } catch (ExpiredJwtException e) {
            return false;
        } catch (JwtException e) {
            log.warn("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    // ─── Process ─────────────────────────────────────────────────────────────────

    public TokenProcessResult processToken(String token, UserDetails userDetails) {
        TokenProcessResult result = new TokenProcessResult();
        try {
            String username = extractUsername(token);
            String role     = extractRole(token);
            String provider = extractProvider(token);
            Date expiration = extractClaim(token, Claims::getExpiration);

            result.setUsername(username);
            result.setRole(role);
            result.setProvider(provider);
            result.setExpiration(expiration);
            result.setTokenExpired(isTokenExpired(token));

            if (userDetails != null) {
                result.setValid(username.equals(userDetails.getUsername()) && !isTokenExpired(token));
            } else {
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

    // ─── Private Helpers ─────────────────────────────────────────────────────────

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            throw e;
        } catch (JwtException | IllegalArgumentException e) {
            throw new JwtException("Invalid token: " + e.getMessage(), e);
        }
    }
}