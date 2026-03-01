package com.APIGateway.Api_Gateway.resolver;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.InetSocketAddress;

@Component  // ✅ No @Primary here — UserKeyResolver is the default
public class IpKeyResolver implements KeyResolver {

    @Override
    public Mono<String> resolve(ServerWebExchange exchange) {
        InetSocketAddress remoteAddr = exchange.getRequest().getRemoteAddress();
        String ip = remoteAddr != null
                ? remoteAddr.getAddress().getHostAddress()
                : "unknown";
        return Mono.just(ip);
    }
}