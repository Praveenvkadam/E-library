package com.user.UserProfile.Config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final GatewayHeaderFilter gatewayHeaderFilter;

    @Value("${cors.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // ✅ Use CorsConfigurationSource bean below
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // ✅ Stateless — no session, JWT via gateway headers
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // ✅ Disable CSRF — REST API, no browser form submissions
                .csrf(AbstractHttpConfigurer::disable)

                // ✅ Inject gateway header filter before auth filter
                .addFilterBefore(gatewayHeaderFilter, UsernamePasswordAuthenticationFilter.class)

                .authorizeHttpRequests(auth -> auth

                        // ── Public — Swagger ──────────────────────────
                        .requestMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/api-docs/**",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // ── Public — Actuator health check ────────────
                        .requestMatchers("/actuator/health").permitAll()

                        // ── Preflight — OPTIONS must be allowed ────────
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ── All profile endpoints require X-User-Id ───
                        .requestMatchers("/api/profile/**").authenticated()

                        // ── Deny everything else ──────────────────────
                        .anyRequest().denyAll()
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));
        config.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "X-User-Id",
                "X-User-Email",
                "Accept",
                "Origin"
        ));
        config.setExposedHeaders(List.of(
                "Authorization",
                "X-User-Id"
        ));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}