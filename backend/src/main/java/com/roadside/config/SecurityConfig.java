package com.roadside.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    
    private final JWTAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JWTAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/", "/error", "/favicon.ico").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/mechanics/**").permitAll()
                .requestMatchers("/ws/**").permitAll()
                // Role-based endpoints
                .requestMatchers("/api/client/**", "/api/v1/client/**").hasRole("CLIENT")
                .requestMatchers("/api/mechanic/**", "/api/v1/mechanic/**").hasRole("MECHANIC")
                // Authenticated endpoints
                .requestMatchers("/api/v1/user/**").authenticated()
                .requestMatchers("/api/v1/requests/**").authenticated()
                .requestMatchers("/api/repair-requests/**", "/api/v1/repair-requests/**").authenticated()
                // Allow AI endpoints during local dev to ease testing (remove or lock down in prod)
                .requestMatchers("/api/ai/**", "/api/v1/ai/**").permitAll()
                .requestMatchers("/api/v1/notifications/**").authenticated()
                .requestMatchers("/api/v1/ratings/**").authenticated()
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:5173"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
