package com.APIGateway.Api_Gateway.filter;

import com.APIGateway.Api_Gateway.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpRequestDecorator;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

@Slf4j
@Component
public class AuthFilter extends AbstractGatewayFilterFactory<AuthFilter.Config> {

    private final JwtUtil jwtUtil;

    private static final List<String> OPEN_ENDPOINTS = List.of(
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/restpass",
            "/api/auth/valid/",
            "/api/auth/google"
    );

    public AuthFilter(JwtUtil jwtUtil) {
        super(Config.class);
        this.jwtUtil = jwtUtil;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {

            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();

            log.debug("Incoming request path: {}", path);

            // Step 1 — Skip JWT check for public endpoints
            if (isOpenEndpoint(path)) {
                log.debug("Public endpoint — skipping auth: {}", path);
                return chain.filter(exchange);
            }

            // Step 2 — Check Authorization header exists
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                log.warn("Missing Authorization header for path: {}", path);
                return onError(exchange, "Missing Authorization header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            // Step 3 — Check Bearer format
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("Invalid Authorization header format for path: {}", path);
                return onError(exchange,
                        "Invalid Authorization header — must start with Bearer",
                        HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            // Step 4 — Parse and validate token in ONE call
            Claims claims;
            try {
                claims = jwtUtil.extractAllClaims(token);
                if (claims.getExpiration().before(new Date())) {
                    log.warn("Expired token for path: {}", path);
                    return onError(exchange, "Token is invalid or expired", HttpStatus.UNAUTHORIZED);
                }
            } catch (Exception e) {
                log.warn("Token parsing failed for path: {} | reason: {}", path, e.getMessage());
                return onError(exchange, "Token is invalid or expired", HttpStatus.UNAUTHORIZED);
            }

            // Step 5 — Extract user details from already-parsed claims (no re-parse)
            String userId      = jwtUtil.extractUserId(claims);
            String email       = jwtUtil.extractEmail(claims);
            String name        = jwtUtil.extractName(claims);
            List<String> roles = jwtUtil.extractRoles(claims);
            String rolesValue  = (roles != null) ? String.join(",", roles) : "";

            log.debug("Authenticated user — id: {}, email: {}, roles: {}", userId, email, roles);

            // Step 6 — Inject user headers via ServerHttpRequestDecorator
            final String finalRolesValue = rolesValue;
            ServerHttpRequest mutatedRequest = new ServerHttpRequestDecorator(request) {
                @Override
                public HttpHeaders getHeaders() {
                    HttpHeaders mutableHeaders = new HttpHeaders();
                    mutableHeaders.addAll(super.getHeaders());
                    mutableHeaders.set("X-User-Id",    userId);
                    mutableHeaders.set("X-User-Email", email);
                    mutableHeaders.set("X-User-Name",  name);
                    mutableHeaders.set("X-User-Roles", finalRolesValue);
                    return HttpHeaders.readOnlyHttpHeaders(mutableHeaders);
                }
            };

            return chain.filter(
                    exchange.mutate().request(mutatedRequest).build()
            );
        };
    }

    private boolean isOpenEndpoint(String path) {
        return OPEN_ENDPOINTS.stream().anyMatch(path::startsWith);
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String body = """
                {
                  "status": %d,
                  "error": "%s",
                  "message": "%s"
                }
                """.formatted(status.value(), status.getReasonPhrase(), message);

        DataBuffer buffer = response.bufferFactory()
                .wrap(body.getBytes(StandardCharsets.UTF_8));

        return response.writeWith(Mono.just(buffer));
    }

    public static class Config {
    }
}