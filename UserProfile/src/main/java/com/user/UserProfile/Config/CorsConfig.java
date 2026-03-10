package com.user.UserProfile.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // ✅ Allow frontend origin
        config.setAllowedOrigins(List.of(
                "http://localhost:3000"
        ));

        // ✅ Allow all standard HTTP methods
        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        // ✅ Allow all headers including custom ones
        config.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "X-User-Id",
                "X-User-Email",
                "Accept",
                "Origin"
        ));

        // ✅ Expose headers frontend might need to read
        config.setExposedHeaders(List.of(
                "Authorization",
                "X-User-Id"
        ));

        // ✅ Allow cookies / auth headers in requests
        config.setAllowCredentials(true);

        // ✅ Cache preflight response for 1 hour — reduces OPTIONS requests
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);  // apply to all endpoints

        return new CorsFilter(source);
    }
}