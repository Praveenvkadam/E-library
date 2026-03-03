package com.APIGateway.Api_Gateway.config;

import com.APIGateway.Api_Gateway.filter.AuthFilter;
import com.APIGateway.Api_Gateway.filter.RoleFilter;
import com.APIGateway.Api_Gateway.resolver.IpKeyResolver;
import com.APIGateway.Api_Gateway.resolver.UserKeyResolver;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class GatewayConfig {

    private final AuthFilter authFilter;
    private final RoleFilter roleFilter;
    private final UserKeyResolver userKeyResolver;
    private final IpKeyResolver ipKeyResolver;

    public GatewayConfig(
            AuthFilter authFilter,
            RoleFilter roleFilter,
            @Qualifier("userKeyResolver") UserKeyResolver userKeyResolver,
            @Qualifier("ipKeyResolver")   IpKeyResolver ipKeyResolver) {
        this.authFilter      = authFilter;
        this.roleFilter      = roleFilter;
        this.userKeyResolver = userKeyResolver;
        this.ipKeyResolver   = ipKeyResolver;
    }

    @Bean
    public RedisRateLimiter redisRateLimiter() {
        return new RedisRateLimiter(20, 40);
    }

    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder) {
        return builder.routes()

                // ================================================
                // ROUTE 1 — Auth Public (No JWT, No Rate Limit)
                // ================================================
                .route("auth-public", r -> r
                        .path(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/restpass",
                                "/api/auth/valid/**",
                                "/api/auth/google/**"
                        )
                        .uri("lb://AUTHENTICATION")
                )

                // ================================================
                // ROUTE 2 — Auth Protected (JWT + Rate Limit)
                // ================================================
                .route("auth-protected", r -> r
                        .path("/api/auth/**")
                        .filters(f -> f
                                .filter(authFilter.apply(new AuthFilter.Config()))
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(redisRateLimiter())
                                        .setKeyResolver(userKeyResolver)
                                )
                        )
                        .uri("lb://AUTHENTICATION")
                )

                // ================================================
                // ROUTE 3 — Books ADMIN Only (JWT + ROLE_ADMIN)
                // ⚠️ Must be BEFORE book-public route
                // ================================================
                .route("book-admin-routes", r -> r
                        .path(
                                "/api/books/upload",
                                "/api/books/update/**",
                                "/api/books/delete/**"
                        )
                        .filters(f -> f
                                .filter(authFilter.apply(new AuthFilter.Config()))
                                .filter(roleFilter.apply(
                                        new RoleFilter.Config(List.of("ROLE_ADMIN"))
                                ))
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(redisRateLimiter())
                                        .setKeyResolver(userKeyResolver)
                                )
                        )
                        .uri("lb://BOOKUPLOAD")
                )

                // ================================================
                // ROUTE 4 — Books Public (JWT only)
                // ================================================
                .route("book-public-routes", r -> r
                        .path(
                                "/api/books",
                                "/api/books/search"
                        )
                        .filters(f -> f
                                .filter(authFilter.apply(new AuthFilter.Config()))
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(redisRateLimiter())
                                        .setKeyResolver(userKeyResolver)
                                )
                        )
                        .uri("lb://BOOKUPLOAD")
                )

                // ================================================
                // ✅ ROUTE 5 — Subscription Public (No JWT)
                // Covers: initiate order, verify payment (Razorpay callback)
                // ⚠️ Must be BEFORE subscription-protected route
                // ================================================
                .route("subscription-public", r -> r
                        .path(
                                "/api/v1/subscriptions/initiate",
                                "/api/v1/subscriptions/verify"
                        )
                        .uri("lb://SUBSCRIPTION-SERVICE")
                )

                // ================================================
                // ✅ ROUTE 6 — Subscription Protected (JWT + Rate Limit)
                // Covers: get subscription status, cancel, etc.
                // ================================================
                .route("subscription-protected", r -> r
                        .path("/api/v1/subscriptions/**")
                        .filters(f -> f
                                .filter(authFilter.apply(new AuthFilter.Config()))
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(redisRateLimiter())
                                        .setKeyResolver(userKeyResolver)
                                )
                        )
                        .uri("lb://SUBSCRIPTION-SERVICE")
                )

                .build();
    }
}