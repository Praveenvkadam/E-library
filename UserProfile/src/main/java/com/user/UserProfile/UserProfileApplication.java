package com.user.UserProfile;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.user.UserProfile.Feign")
@EnableRetry
@EnableAsync
public class UserProfileApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserProfileApplication.class, args);
    }
}
