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
import org.springframework.http.HttpMethod;

import java.util.List;

@Configuration
public class GatewayConfig {

    private final AuthFilter authFilter;
    private final RoleFilter roleFilter;
    private final UserKeyResolver userKeyResolver;
    private final IpKeyResolver ipKeyResolver;

    @Value("${ai_service.url}")
    private String aiServiceUrl;

    @Value("${book_service.url}")
    private String bookServiceUrl;

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
                               @Qualifier("redisRateLimiter")      RedisRateLimiter redisRateLimiter,
                               @Qualifier("aiAnalysisRateLimiter") RedisRateLimiter aiAnalysisRateLimiter,
                               @Qualifier("aiTtsRateLimiter")      RedisRateLimiter aiTtsRateLimiter,
                               @Qualifier("aiSummaryRateLimiter")  RedisRateLimiter aiSummaryRateLimiter) {
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
                // POST (upload), PUT (update), DELETE — admin only
                // ⚠️ Must be BEFORE book-public routes
                // ================================================
                .route("book-admin-routes", r -> r
                        .path("/api/books/upload", "/api/books/**")
                        .and()
                        .method(HttpMethod.POST, HttpMethod.PUT, HttpMethod.DELETE)
                        .filters(f -> f
                                .filter(authFilter.apply(new AuthFilter.Config()))
                                .filter(roleFilter.apply(
                                        new RoleFilter.Config(List.of("ADMIN"))
                                ))
                                // ✅ Remove X-Frame-Options so admin UI iframes work
                                .removeResponseHeader("X-Frame-Options")
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(redisRateLimiter)
                                        .setKeyResolver(userKeyResolver)
                                )
                        )
                        .uri(bookServiceUrl)
                )

                // ================================================
                // ROUTE 4 — Book PDF Stream (JWT + dedicated route)
                // ⚠️ Must be BEFORE book-public-routes (more specific)
                // Needs X-Frame-Options removed for iframe rendering
                // ================================================
                .route("book-pdf-stream", r -> r
                        .path("/api/books/*/pdf")
                        .and()
                        .method(HttpMethod.GET)
                        .filters(f -> f
                                .filter(authFilter.apply(new AuthFilter.Config()))
                                // ✅ Allow PDF to render inside <iframe>
                                .removeResponseHeader("X-Frame-Options")
                                // ✅ Allow embedding from same origin
                                .addResponseHeader("Content-Security-Policy", "frame-ancestors 'self'")
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(redisRateLimiter)
                                        .setKeyResolver(userKeyResolver)
                                )
                        )
                        .uri(bookServiceUrl)
                )

                // ================================================
                // ROUTE 5 — Books Public (GET only — JWT only)
                // ================================================
                .route("book-public-routes", r -> r
                        .path("/api/books/**", "/api/books")
                        .and()
                        .method(HttpMethod.GET)
                        .filters(f -> f
                                .filter(authFilter.apply(new AuthFilter.Config()))
                                .removeResponseHeader("X-Frame-Options")
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(redisRateLimiter)
                                        .setKeyResolver(userKeyResolver)
                                )
                        )
                        .uri(bookServiceUrl)
                )

                // ================================================
                // ROUTE 6 — Subscription Public (No JWT)
                // ================================================
                .route("subscription-public", r -> r
                        .path(
                                "/api/v1/subscriptions/initiate",
                                "/api/v1/subscriptions/verify"
                        )
                        .uri("lb://SUBSCRIPTION-SERVICE")
                )

                // ================================================
                // ROUTE 7 — Subscription Protected (JWT + Rate Limit)
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
                // ROUTE 8 — AI Health Check (Public - No JWT)
                // ================================================
                .route("ai-health", r -> r
                        .path("/api/ai/health")
                        .filters(f -> f
                                .rewritePath("/api/ai/(?<segment>.*)", "/ai/${segment}")
                        )
                        .uri(aiServiceUrl)
                )

                // ================================================
                // ROUTE 9 — AI TTS Languages (Public - No JWT)
                // ================================================
                .route("ai-tts-languages", r -> r
                        .path("/api/ai/tts/languages")
                        .filters(f -> f
                                .rewritePath("/api/ai/(?<segment>.*)", "/ai/${segment}")
                        )
                        .uri(aiServiceUrl)
                )

                // ================================================
                // ROUTE 10 — AI Analysis (Protected)
                // ⚠️ Must be BEFORE ai-tts route
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
                // ROUTE 11 — AI TTS (Protected)
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

                // ================================================
                // ROUTE 12 — AI Summary (Protected)
                // ================================================
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