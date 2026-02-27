package com.BookUpload.BookUpload.Config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name}")
    String CLOUD_NAME ;

    @Value("${cloudinary.api-key}")
    String Api_key ;

    @Value("${cloudinary.api-secret}")
    String Api_secret ;

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(Map.of(

                "cloud_name", CLOUD_NAME,
                "api_key", Api_key,
                "api_secret", Api_secret
        ));
    }
}

