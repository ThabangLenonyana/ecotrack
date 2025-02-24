package com.enviro.assessment.grad001.thabanglenonyana.waste_management;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAPIConfig {
    @Bean
    public OpenAPI apiConfig() {
        Server localServer = new Server()
            .url("http://localhost:8080")
            .description("Local Development Server");

        Contact contact = new Contact()
            .name("Thabang Lenonyana")
            .email("lenonyanathabang@gmail.com");

        Info info = new Info()
            .title("Waste Management API")
            .version("1.0")
            .description("REST API for Enviro365 waste sorting mobile application")
            .contact(contact);

        return new OpenAPI()
            .info(info)
            .servers(List.of(localServer));
    }
}
