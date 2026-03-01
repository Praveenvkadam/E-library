package com.APIGateway.Api_Gateway.resolver;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
@Primary
public class UserKeyResolver implements KeyResolver {

    @Override
    public Mono<String> resolve(ServerWebExchange exchange) {
        String userId = exchange.getRequest()
                .getHeaders()
                .getFirst("X-User-Id");
        return Mono.justOrEmpty(userId)
                .defaultIfEmpty("anonymous");
    }
}