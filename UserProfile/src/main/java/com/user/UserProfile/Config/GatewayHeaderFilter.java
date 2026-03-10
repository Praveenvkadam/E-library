package com.user.UserProfile.Config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
public class GatewayHeaderFilter extends OncePerRequestFilter {

    private static final String USER_ID_HEADER    = "X-User-Id";
    private static final String USER_EMAIL_HEADER = "X-User-Email";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Skip filter for public paths
        String path = request.getRequestURI();
        if (isPublicPath(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        String userId = request.getHeader(USER_ID_HEADER);
        String email  = request.getHeader(USER_EMAIL_HEADER);

        if (userId == null || userId.isBlank()) {
            log.warn("⚠️ Missing X-User-Id header → path: [{}]", path);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("""
                {
                  "status": 401,
                  "error": "Unauthorized",
                  "message": "Missing required header: X-User-Id"
                }
            """);
            return;
        }

        // ✅ Set authentication in Spring Security context
        var authentication = new UsernamePasswordAuthenticationToken(
                userId,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
        authentication.setDetails(email);  // attach email as details
        SecurityContextHolder.getContext().setAuthentication(authentication);

        log.debug("🔐 Authenticated via gateway header → userId: [{}]", userId);
        filterChain.doFilter(request, response);
    }

    private boolean isPublicPath(String path) {
        return path.startsWith("/swagger-ui") ||
                path.startsWith("/api-docs")   ||
                path.startsWith("/v3/api-docs") ||
                path.equals("/actuator/health");
    }
}