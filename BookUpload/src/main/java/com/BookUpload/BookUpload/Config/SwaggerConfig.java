package com.BookUpload.BookUpload.Config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI bookUploadOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Book Upload API")
                        .description("REST API for managing book uploads, searches, and deletions")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Admin")
                                .email("admin@bookupload.com")));
    }
}