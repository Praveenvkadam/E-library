package com.APIGateway.Api_Gateway.filter;

import com.APIGateway.Api_Gateway.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Component
public class AuthFilter extends AbstractGatewayFilterFactory<AuthFilter.Config> {

    private final JwtUtil jwtUtil;

    // ✅ Matches your exact AuthController public endpoints
    private static final List<String> OPEN_ENDPOINTS = List.of(
            "/api/auth/register",       // POST - Register
            "/api/auth/login",          // POST - Login
            "/api/auth/restpass",       // POST - Reset Password
            "/api/auth/valid/",         // GET  - Validate Token
            "/api/auth/google"          // GET  - Google OAuth
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

            // ✅ Step 1 — Skip JWT check for public endpoints
            if (isOpenEndpoint(path)) {
                log.debug("Public endpoint — skipping auth: {}", path);
                return chain.filter(exchange);
            }

            // ✅ Step 2 — Check Authorization header exists
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                log.warn("Missing Authorization header for path: {}", path);
                return onError(exchange,
                        "Missing Authorization header",
                        HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            // ✅ Step 3 — Check Bearer format
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("Invalid Authorization header format for path: {}", path);
                return onError(exchange,
                        "Invalid Authorization header — must start with Bearer",
                        HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            // ✅ Step 4 — Validate token
            if (!jwtUtil.isTokenValid(token)) {
                log.warn("Invalid or expired token for path: {}", path);
                return onError(exchange,
                        "Token is invalid or expired",
                        HttpStatus.UNAUTHORIZED);
            }

            // ✅ Step 5 — Extract user details from token
            String userId = jwtUtil.extractUserId(token);
            String email  = jwtUtil.extractEmail(token);
            String name   = jwtUtil.extractName(token);
            List<String> roles = jwtUtil.extractRoles(token);

            log.debug("Authenticated user — id: {}, email: {}, roles: {}",
                    userId, email, roles);

            // ✅ Step 6 — Inject user details as headers to downstream services
            ServerHttpRequest mutatedRequest = request.mutate()
                    .header("X-User-Id",    userId)
                    .header("X-User-Email", email)
                    .header("X-User-Name",  name)
                    .header("X-User-Roles", String.join(",", roles))
                    .build();

            return chain.filter(
                    exchange.mutate().request(mutatedRequest).build()
            );
        };
    }

    // ✅ Check if path is in open endpoints list
    private boolean isOpenEndpoint(String path) {
        return OPEN_ENDPOINTS.stream()
                .anyMatch(path::startsWith);
    }

    // ✅ Return error response as JSON
    private Mono<Void> onError(ServerWebExchange exchange,
                               String message,
                               HttpStatus status) {

        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String body = """
                {
                  "status": %d,
                  "error": "%s",
                  "message": "%s"
                }
                """.formatted(
                status.value(),
                status.getReasonPhrase(),
                message
        );

        DataBuffer buffer = response.bufferFactory()
                .wrap(body.getBytes(StandardCharsets.UTF_8));

        return response.writeWith(Mono.just(buffer));
    }

    // ✅ Config class — add properties here if needed later
    public static class Config {
        // Example future use:
        // private boolean requireHttps;
    }
}