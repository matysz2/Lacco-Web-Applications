package com.example.Lacco.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;

@Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                // 1. Pozwól na zapytania typu OPTIONS (CORS preflight)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // 2. PUBLICZNE ENDPOINTY (Logowanie i Rejestracja)
                // Dodano /api/auth/** ponieważ Twój front-end uderza w lacco.pl/api/auth/login
                .requestMatchers("/api/auth/**", "/auth/**").permitAll()
                
                // 3. Specyficzne wyjątki (np. dla traderów)
                .requestMatchers("/api/orders/trader/**").permitAll()
                
                // 4. Cała reszta API wymaga zalogowania
                .requestMatchers("/api/**").authenticated()
                
                // 5. Jakiekolwiek inne zapytanie również wymaga autoryzacji
                .anyRequest().authenticated()
            )
            // Dodanie filtra JWT przed filtrem logowania
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    
    // Dodano Twoje domeny produkcyjne z HTTPS
    configuration.setAllowedOrigins(List.of(
        "https://lacco.pl", 
        "https://www.lacco.pl",
        "http://localhost:3000", 
        "http://localhost:5173", 
        "http://localhost", 
        "http://127.0.0.1:5173"
    ));
    
    // Wzorce dla środowiska deweloperskiego
    configuration.setAllowedOriginPatterns(List.of(
        "http://localhost:*", 
        "http://127.0.0.1:*"
    ));
    
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    
    // Nagłówki wymagane do komunikacji z React i JWT
    configuration.setAllowedHeaders(List.of(
        "Authorization", 
        "Cache-Control", 
        "Content-Type", 
        "X-Requested-With", 
        "Access-Control-Allow-Origin"
    ));
    
    // Pozwala na przesyłanie ciasteczek i nagłówka Authorization
    configuration.setAllowCredentials(true);
    
    // Umożliwia Reactowi odczytanie tokena JWT z nagłówka
    configuration.setExposedHeaders(List.of("Authorization"));

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}

@Bean
public CorsFilter corsFilter() {
    CorsConfiguration configuration = new CorsConfiguration();
    
    // Musi być identyczne jak powyżej
    configuration.setAllowedOrigins(List.of(
        "https://lacco.pl", 
        "https://www.lacco.pl",
        "http://localhost:3000", 
        "http://localhost:5173", 
        "http://localhost", 
        "http://127.0.0.1:5173"
    ));
    
    configuration.setAllowedOriginPatterns(List.of(
        "http://localhost:*", 
        "http://127.0.0.1:*"
    ));
    
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of(
        "Authorization", 
        "Cache-Control", 
        "Content-Type", 
        "X-Requested-With", 
        "Access-Control-Allow-Origin"
    ));
    
    configuration.setAllowCredentials(true);
    configuration.setExposedHeaders(List.of("Authorization"));

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return new CorsFilter(source);
}
}
