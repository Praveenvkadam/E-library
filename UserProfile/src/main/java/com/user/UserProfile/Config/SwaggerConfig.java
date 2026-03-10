package com.user.UserProfile.Config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.parameters.HeaderParameter;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI userProfileOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("UserProfile Service API")
                        .description("e-library user profile microservice")
                        .version("v1.0.0"))
                .servers(List.of(
                        new Server().url("http://localhost:8082").description("Local"),
                        new Server().url("http://localhost:8080").description("Via API Gateway")
                ));
    }

    // ✅ Injects X-User-Id and X-User-Email into every endpoint in Swagger UI
    @Bean
    public OperationCustomizer globalHeaderCustomizer() {
        return (operation, handlerMethod) -> {
            operation.addParametersItem(
                    new HeaderParameter()
                            .name("X-User-Id")
                            .description("Authenticated user ID")
                            .required(true)
                            .schema(new StringSchema().example("user-001"))
            );
            operation.addParametersItem(
                    new HeaderParameter()
                            .name("X-User-Email")
                            .description("Authenticated user email (optional)")
                            .required(false)
                            .schema(new StringSchema().example("example@gmail.com"))
            );
            return operation;
        };
    }
}