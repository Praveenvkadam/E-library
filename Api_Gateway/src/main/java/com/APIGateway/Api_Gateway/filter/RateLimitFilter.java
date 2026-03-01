package com.APIGateway.Api_Gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;

@Slf4j
@Component
public class RateLimitFilter implements GlobalFilter, Ordered {

    // ✅ Declared ONCE here
    private final ReactiveStringRedisTemplate redisTemplate;

    private static final int MAX_REQUESTS    = 20;
    private static final int WINDOW_SECONDS  = 1;

    private static final List<String> OPEN_PATHS = List.of("/api/auth/");

    // ✅ Constructor uses different parameter name to avoid conflict
    public RateLimitFilter(ReactiveStringRedisTemplate stringRedisTemplate) {
        this.redisTemplate = stringRedisTemplate;  // ✅ Assign here
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // Skip rate limiting for open paths
        if (OPEN_PATHS.stream().anyMatch(path::startsWith)) {
            return chain.filter(exchange);
        }

        // Get IP address
        String ip = getClientIp(request);

        // Get User ID from header (injected by AuthFilter)
        String userId = request.getHeaders().getFirst("X-User-Id");

        // Check both IP and User rate limits
        Mono<Boolean> ipCheck   = isAllowed("rate:ip:" + ip);
        Mono<Boolean> userCheck = userId != null
                ? isAllowed("rate:user:" + userId)
                : Mono.just(true);

        return Mono.zip(ipCheck, userCheck)
                .flatMap(tuple -> {
                    boolean ipAllowed   = tuple.getT1();
                    boolean userAllowed = tuple.getT2();

                    if (!ipAllowed) {
                        log.warn("Rate limit exceeded for IP: {}", ip);
                        return onRateLimitExceeded(exchange,
                                "Too many requests from your IP");
                    }

                    if (!userAllowed) {
                        log.warn("Rate limit exceeded for User: {}", userId);
                        return onRateLimitExceeded(exchange,
                                "Too many requests for this user");
                    }

                    return chain.filter(exchange);
                });
    }

    private Mono<Boolean> isAllowed(String key) {
        return redisTemplate.opsForValue()
                .increment(key)
                .flatMap(count -> {
                    if (count == 1) {
                        return redisTemplate
                                .expire(key, Duration.ofSeconds(WINDOW_SECONDS))
                                .thenReturn(true);
                    }
                    return Mono.just(count <= MAX_REQUESTS);
                });
    }

    private String getClientIp(ServerHttpRequest request) {
        String xForwardedFor = request.getHeaders().getFirst("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        InetSocketAddress remoteAddr = request.getRemoteAddress();
        return remoteAddr != null
                ? remoteAddr.getAddress().getHostAddress()
                : "unknown";
    }

    private Mono<Void> onRateLimitExceeded(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        response.getHeaders().add("X-RateLimit-Limit", String.valueOf(MAX_REQUESTS));
        response.getHeaders().add("Retry-After", String.valueOf(WINDOW_SECONDS));

        String body = """
                {
                  "status": 429,
                  "error": "Too Many Requests",
                  "message": "%s",
                  "limit": %d,
                  "window": "%d second"
                }
                """.formatted(message, MAX_REQUESTS, WINDOW_SECONDS);

        DataBuffer buffer = response.bufferFactory()
                .wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -1; // ✅ Runs BEFORE AuthFilter
    }
}