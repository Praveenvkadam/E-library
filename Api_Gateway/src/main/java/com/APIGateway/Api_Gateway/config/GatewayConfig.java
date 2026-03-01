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
                // Covers: /api/auth/getall, /api/auth/{token}
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
                // ROUTE 3 — Books ADMIN Only (JWT + ROLE_ADMIN + Rate Limit)
                // Covers: upload, update, delete
                // ⚠️ Must be BEFORE book-public route
                // ================================================
                .route("book-admin-routes", r -> r
                        .path(
                                "/api/books/upload",
                                "/api/books/update/**",
                                "/api/books/delete/**"
                        )
                        .filters(f -> f
                                // Step 1 — Validate JWT & inject X-User-* headers
                                .filter(authFilter.apply(new AuthFilter.Config()))
                                // Step 2 — Check ROLE_ADMIN
                                .filter(roleFilter.apply(
                                        new RoleFilter.Config(List.of("ROLE_ADMIN"))
                                ))
                                // Step 3 — Rate limit by userId
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(redisRateLimiter())
                                        .setKeyResolver(userKeyResolver)
                                )
                        )
                        .uri("lb://BOOKUPLOAD")
                )

                // ================================================
                // ROUTE 4 — Books Public (JWT only, No Role Check)
                // Covers: getAll, search
                // ================================================
                .route("book-public-routes", r -> r
                        .path(
                                "/api/books",
                                "/api/books/search"
                        )
                        .filters(f -> f
                                // JWT only — no role check needed
                                .filter(authFilter.apply(new AuthFilter.Config()))
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(redisRateLimiter())
                                        .setKeyResolver(userKeyResolver)
                                )
                        )
                        .uri("lb://BOOKUPLOAD")
                )

                .build();
    }
}
//```
//
//        ---
//
//        ## Route Access Map
//```
//        /api/auth/register          →  No JWT  ✅ Public
///api/auth/login             →  No JWT  ✅ Public
///api/auth/restpass          →  No JWT  ✅ Public
///api/auth/valid/**          →  No JWT  ✅ Public
// /api/auth/**                →  JWT     🔐 Any logged-in user
//
// /api/books/upload           →  JWT + ROLE_ADMIN  👑 Admin only
// /api/books/update/**        →  JWT + ROLE_ADMIN  👑 Admin only
// /api/books/delete/**        →  JWT + ROLE_ADMIN  👑 Admin only  (matches /{id} DELETE)
// /api/books                  →  JWT     🔐 Any logged-in user
// /api/books/search           →  JWT     🔐 Any logged-in user
// ```
//
// ---
//
// ## ⚠️ Important — Route Order Matters
// ```
// book-admin-routes  ← checked FIRST (specific paths)
// ↓
// book-public-routes ← checked SECOND (fallback)