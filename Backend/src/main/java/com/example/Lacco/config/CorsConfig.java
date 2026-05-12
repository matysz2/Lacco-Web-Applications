package com.example.Lacco.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
             registry.addMapping("/**")
        .allowedOriginPatterns(
                "http://localhost:*",
                "http://127.0.0.1:*",
                "https://lacco.pl",
                "https://www.lacco.pl",
                "http://34.55.34.201:*",
                "http://34.7.166.90:*",
                "http://34.7.166.90:8081",
                "http://34.185.171.112:8081"
        )
        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
        .allowedHeaders("*")
        .allowCredentials(true);
            }
        };
    }
}
