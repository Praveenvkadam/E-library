package com.Authentication.Authentication.config;


import com.Authentication.Authentication.entity.Authprovider;
import com.Authentication.Authentication.entity.Role;
import com.Authentication.Authentication.entity.User;
import com.Authentication.Authentication.repo.UserRepo;
import com.Authentication.Authentication.service.JwtService;
import org.springframework.stereotype.Component;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import java.io.IOException;


import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepo userRepository;
    private final JwtService jwtService;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        String email = oauthUser.getAttribute("email");
        Boolean verified = oauthUser.getAttribute("email_verified");

        if (verified == null || !verified) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                        boolean isFirstUser = userRepository.count() == 0;
                        return userRepository.save(
                                User.builder()
                                        .email(email)
                                        .role(isFirstUser ? Role.ADMIN : Role.USER)
                                        .provider(Authprovider.GOOGLE)
                                        .build()
                        );
                });

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

        response.sendRedirect(
                "http://localhost:3000/?token=" + token
        );
    }
}


