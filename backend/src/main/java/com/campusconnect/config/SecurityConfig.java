package com.campusconnect.config;

import com.campusconnect.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {
    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/clubs/register", "/clubs/login").permitAll()
                .requestMatchers("/students/register", "/students/login").permitAll()
                .requestMatchers("/events", "/events/*").permitAll()
                .requestMatchers("/tickets/book").permitAll()
                .requestMatchers("/tickets/my-tickets").permitAll()
                .requestMatchers("/tickets/*").authenticated()  // Cancel ticket - requires auth
                .requestMatchers("/tickets/event/*/attendees").hasRole("CLUB")
                .requestMatchers("/tickets/export/**").hasRole("CLUB")
                .requestMatchers("/events/create").hasRole("CLUB")
                .anyRequest().permitAll()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
