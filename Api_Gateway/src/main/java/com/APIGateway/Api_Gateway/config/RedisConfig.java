package com.APIGateway.Api_Gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.connection.ReactiveRedisConnectionFactory;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    @Bean
    @Primary   // ✅ Marks this as the default bean when 2 are found
    public ReactiveRedisTemplate<String, String> reactiveRedisTemplate(
            ReactiveRedisConnectionFactory factory) {

        RedisSerializationContext<String, String> context =
                RedisSerializationContext.<String, String>newSerializationContext(
                                new StringRedisSerializer())
                        .value(new StringRedisSerializer())
                        .build();

        return new ReactiveRedisTemplate<>(factory, context);
    }
}