package com.Authentication.Authentication.config;

import com.Authentication.Authentication.entity.Authprovider;
import com.Authentication.Authentication.entity.Role;
import com.Authentication.Authentication.entity.User;
import com.Authentication.Authentication.repo.UserRepo;
import com.Authentication.Authentication.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

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

        String email    = oauthUser.getAttribute("email");
        Boolean verified = oauthUser.getAttribute("email_verified");
        String name     = oauthUser.getAttribute("name");
        String picture  = oauthUser.getAttribute("picture");

        // 1. Reject unverified Google accounts
        if (verified == null || !verified) {
            response.sendRedirect("http://localhost:3000/login?error=unverified");
            return;
        }

        // 2. Check for provider conflict
        User user = userRepository.findByEmail(email).orElse(null);

        if (user != null && user.getProvider() != Authprovider.GOOGLE) {
            response.sendRedirect("http://localhost:3000/login?error=use_password_login");
            return;
        }

        // 3. Create new user if not found
        if (user == null) {
            boolean isFirstUser = userRepository.count() == 0;
            user = userRepository.save(
                    User.builder()
                            .email(email)
                            .name(name)
                            .picture(picture)
                            .role(isFirstUser ? Role.ADMIN : Role.USER)
                            .provider(Authprovider.GOOGLE)
                            .build()
            );
        } else {
            user.setName(name);
            user.setPicture(picture);
            userRepository.save(user);
        }


        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getProvider().name()   // "GOOGLE"
        );

        response.sendRedirect("http://localhost:3000/?token=" + token);
    }
}