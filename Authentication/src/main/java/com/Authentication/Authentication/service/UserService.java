package com.Authentication.Authentication.service;

import com.Authentication.Authentication.dto.AuthResponse;
import com.Authentication.Authentication.dto.LoginRequest;
import com.Authentication.Authentication.dto.RegisterRequest;
import com.Authentication.Authentication.dto.RestPass;

public interface UserService {
    void createUser(RegisterRequest registerRequest);
    AuthResponse login(LoginRequest loginRequest);
    AuthResponse restpassword(RestPass restPass);
}
