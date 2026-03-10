package com.user.UserProfile.Feign.config;

import feign.Logger;
import feign.RequestInterceptor;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Slf4j
@Configuration
public class FeignConfig {

    // Forward JWT from incoming request to BookUpload
    @Bean
    public RequestInterceptor requestInterceptor() {
        return template -> {
            var attrs = RequestContextHolder.getRequestAttributes();
            if (attrs instanceof ServletRequestAttributes servletAttrs) {
                String authHeader = servletAttrs.getRequest().getHeader("Authorization");
                if (authHeader != null) template.header("Authorization", authHeader);
            }
        };
    }

    @Bean
    public Logger.Level feignLoggerLevel() {
        return Logger.Level.BASIC;
    }

    @Bean
    public ErrorDecoder errorDecoder() {
        return (methodKey, response) -> {
            log.error("❌ Feign error on [{}] → HTTP {}", methodKey, response.status());
            return switch (response.status()) {
                case 404 -> new RuntimeException("Book not found in BookUpload service");
                case 503 -> new RuntimeException("BookUpload service unavailable");
                default  -> new RuntimeException("BookUpload error: " + response.status());
            };
        };
    }
}