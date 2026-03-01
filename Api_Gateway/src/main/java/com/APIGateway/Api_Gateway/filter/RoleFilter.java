package com.APIGateway.Api_Gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
public class RoleFilter extends AbstractGatewayFilterFactory<RoleFilter.Config> {

    public RoleFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {

            String path = exchange.getRequest().getURI().getPath();

            // ✅ Step 1 — Get X-User-Roles header injected by AuthFilter
            String rolesHeader = exchange.getRequest()
                    .getHeaders()
                    .getFirst("X-User-Roles");

            log.debug("RoleFilter checking path: {} | roles found: {}", path, rolesHeader);

            // ✅ Step 2 — No roles header at all
            if (rolesHeader == null || rolesHeader.isEmpty()) {
                log.warn("No roles header found for path: {}", path);
                return onError(exchange,
                        "Access denied — no roles found in request",
                        HttpStatus.FORBIDDEN);
            }

            // ✅ Step 3 — Parse roles from comma-separated header
            // X-User-Roles: "ROLE_ADMIN,ROLE_USER"  →  ["ROLE_ADMIN", "ROLE_USER"]
            List<String> userRoles = Arrays.stream(rolesHeader.split(","))
                    .map(String::trim)
                    .toList();

            log.debug("User roles: {} | Required roles: {}",
                    userRoles, config.getRequiredRoles());

            // ✅ Step 4 — Check if user has at least ONE required role
            boolean hasRequiredRole = userRoles.stream()
                    .anyMatch(role -> config.getRequiredRoles().contains(role));

            // ✅ Step 5 — Reject if no matching role
            if (!hasRequiredRole) {
                log.warn("Access denied for path: {} | userRoles: {} | requiredRoles: {}",
                        path, userRoles, config.getRequiredRoles());
                return onError(exchange,
                        "Access denied — requires role: " + config.getRequiredRoles(),
                        HttpStatus.FORBIDDEN);
            }

            log.debug("Role check passed for path: {}", path);

            // ✅ Step 6 — Role check passed, continue
            return chain.filter(exchange);
        };
    }

    // ✅ Return JSON error response
    private Mono<Void> onError(ServerWebExchange exchange,
                               String message,
                               HttpStatus status) {

        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String body = """
                {
                  "status": %d,
                  "error": "%s",
                  "message": "%s"
                }
                """.formatted(
                status.value(),
                status.getReasonPhrase(),
                message
        );

        DataBuffer buffer = response.bufferFactory()
                .wrap(body.getBytes(StandardCharsets.UTF_8));

        return response.writeWith(Mono.just(buffer));
    }

    // ✅ Config — holds required roles passed from GatewayConfig
    public static class Config {

        private List<String> requiredRoles;

        // Default constructor (required by AbstractGatewayFilterFactory)
        public Config() {}

        public Config(List<String> requiredRoles) {
            this.requiredRoles = requiredRoles;
        }

        public List<String> getRequiredRoles() {
            return requiredRoles;
        }

        public void setRequiredRoles(List<String> requiredRoles) {
            this.requiredRoles = requiredRoles;
        }
    }
}
