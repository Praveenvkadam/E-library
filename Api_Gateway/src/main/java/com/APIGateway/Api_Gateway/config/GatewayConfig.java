package com.APIGateway.Api_Gateway.config;

import com.APIGateway.Api_Gateway.filter.AuthFilter;
import com.APIGateway.Api_Gateway.filter.RoleFilter;
import com.APIGateway.Api_Gateway.resolver.IpKeyResolver;
import com.APIGateway.Api_Gateway.resolver.UserKeyResolver;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.util.List;

@Configuration
public class GatewayConfig {

    private final AuthFilter authFilter;
    private final RoleFilter roleFilter;
    private final UserKeyResolver userKeyResolver;
    private final IpKeyResolver ipKeyResolver;

    // FIX 2 — Externalized AI service URL (set in application.yml)
    @Value("${ai_service.url}")
    private String aiServiceUrl;

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
    @Primary
    public RedisRateLimiter redisRateLimiter() {
        return new RedisRateLimiter(20, 40);
    }

    @Bean
    public RedisRateLimiter aiAnalysisRateLimiter() {
        return new RedisRateLimiter(10, 20);
    }

    @Bean
    public RedisRateLimiter aiTtsRateLimiter() {
        return new RedisRateLimiter(5, 10);
    }

    @Bean
    public RedisRateLimiter aiSummaryRateLimiter() {
        return new RedisRateLimiter(3, 6);
    }

    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder,
                               // FIX 3 — Inject beans instead of calling methods directly
                               RedisRateLimiter redisRateLimiter,
                               RedisRateLimiter aiAnalysisRateLimiter,
                               RedisRateLimiter aiTtsRateLimiter,
                               RedisRateLimiter aiSummaryRateLimiter) {
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
                                        .setRateLimiter(redisRateLimiter)
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
                                        .setRateLimiter(redisRateLimiter)
                                        .setKeyResolver(userKeyResolver)
                                )
                        )
                        .uri("lb://BOOKUPLOAD")
                )

                // ================================================
                // ROUTE 4 — Books Public (JWT only)
                // FIX 4 — Use /** to cover /api/books/{id} and other read endpoints.
                //          Admin-only routes (upload/update/delete) declared above
                //          take priority due to route ordering.
                // ================================================
                .route("book-public-routes", r -> r
                        .path("/api/books/**", "/api/books")
                        .filters(f -> f
                                .filter(authFilter.apply(new AuthFilter.Config()))
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(redisRateLimiter)
                                        .setKeyResolver(userKeyResolver)
                                )
                        )
                        .uri("lb://BOOKUPLOAD")
                )

                // ================================================
                // ROUTE 5 — Subscription Public (No JWT)
                // ================================================
                .route("subscription-public", r -> r
                        .path(
                                "/api/v1/subscriptions/initiate",
                                "/api/v1/subscriptions/verify"
                        )
                        .uri("lb://SUBSCRIPTION-SERVICE")
                )

                // ================================================
                // ROUTE 6 — Subscription Protected (JWT + Rate Limit)
                // ================================================
                .route("subscription-protected", r -> r
                        .path("/api/v1/subscriptions/**")
                        .filters(f -> f
                                .filter(authFilter.apply(new AuthFilter.Config()))
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(redisRateLimiter)
                                        .setKeyResolver(userKeyResolver)
                                )
                        )
                        .uri("lb://SUBSCRIPTION-SERVICE")
                )

                // ================================================
                // ROUTE 7 — AI Health Check (Public - No JWT)
                // ================================================
                .route("ai-health", r -> r
                        .path("/api/ai/health")
                        .filters(f -> f
                                .rewritePath("/api/ai/(?<segment>.*)", "/ai/${segment}")
                        )
                        // FIX 2 — Use injected property instead of hardcoded localhost
                        .uri(aiServiceUrl)
                )

                // ================================================
                // ROUTE 8 — AI TTS Languages (Public - No JWT)
                // ================================================
                .route("ai-tts-languages", r -> r
                        .path("/api/ai/tts/languages")
                        .filters(f -> f
                                .rewritePath("/api/ai/(?<segment>.*)", "/ai/${segment}")
                        )
                        .uri(aiServiceUrl)
                )

                // ================================================
                // ROUTE 9 — AI Analysis (Protected)
                // ⚠️ Must be BEFORE ai-tts route
                // FIX 1 — authFilter runs BEFORE rewritePath so it sees the original path
                // ================================================
                .route("ai-analysis", r -> r
                        .path("/api/ai/analysis/**")
                        .filters(f -> f
                                .filter(authFilter.apply(new AuthFilter.Config()))
                                .rewritePath("/api/ai/(?<segment>.*)", "/ai/${segment}")
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(aiAnalysisRateLimiter)
                                        .setKeyResolver(userKeyResolver)
                                )
                        )
                        .uri(aiServiceUrl)
                )

                // ================================================
                // ROUTE 10 — AI TTS (Protected)
                // FIX 1 — authFilter runs BEFORE rewritePath
                // ================================================
                .route("ai-tts", r -> r
                        .path("/api/ai/tts/**")
                        .filters(f -> f
                                .filter(authFilter.apply(new AuthFilter.Config()))
                                .rewritePath("/api/ai/(?<segment>.*)", "/ai/${segment}")
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(aiTtsRateLimiter)
                                        .setKeyResolver(userKeyResolver)
                                )
                        )
                        .uri(aiServiceUrl)
                )

                .route("ai-summary", r -> r
                        .path("/api/ai/summary/**")
                        .filters(f -> f
                                .filter(authFilter.apply(new AuthFilter.Config()))
                                .rewritePath("/api/ai/(?<segment>.*)", "/ai/${segment}")
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(aiSummaryRateLimiter)
                                        .setKeyResolver(userKeyResolver)
                                )
                        )
                        .uri(aiServiceUrl)
                )

                .build();
    }
}