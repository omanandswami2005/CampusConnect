package com.campusconnect.security;

import com.campusconnect.repository.ClubRepository;
import com.campusconnect.repository.StudentRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);
    
    private final JwtService jwtService;
    private final ClubRepository clubRepo;
    private final StudentRepository studentRepo;

    public JwtAuthFilter(JwtService jwtService, ClubRepository clubRepo, StudentRepository studentRepo) {
        this.jwtService = jwtService;
        this.clubRepo = clubRepo;
        this.studentRepo = studentRepo;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String auth = request.getHeader("Authorization");
        String requestUri = request.getRequestURI();
        
        log.debug("JWT Filter - URI: {}, Authorization header: {}", 
                requestUri, auth != null ? "Present" : "Missing");
        
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            try {
                var jws = jwtService.parse(token);
                Claims claims = jws.getBody();
                String userId = claims.getSubject();
                String role = claims.get("role", String.class);
                
                log.debug("JWT parsed successfully - UserId: {}, Role: {}", userId, role);
                
                if ("club".equals(role)) {
                    var club = clubRepo.findById(userId).orElse(null);
                    if (club != null) {
                        var authToken = new UsernamePasswordAuthenticationToken(
                                userId, null, List.of(new SimpleGrantedAuthority("ROLE_CLUB")));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        log.info("JWT authenticated - ClubId: {}, ClubName: {}, URI: {}", 
                                userId, club.getClubName(), requestUri);
                    } else {
                        log.warn("JWT authentication failed - Club not found for ClubId: {}", userId);
                    }
                } else if ("student".equals(role)) {
                    var student = studentRepo.findById(userId).orElse(null);
                    if (student != null) {
                        var authToken = new UsernamePasswordAuthenticationToken(
                                userId, null, List.of(new SimpleGrantedAuthority("ROLE_STUDENT")));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        log.info("JWT authenticated - StudentId: {}, Name: {}, URI: {}", 
                                userId, student.getName(), requestUri);
                    } else {
                        log.warn("JWT authentication failed - Student not found for StudentId: {}", userId);
                    }
                }
            } catch (Exception e) {
                log.warn("JWT authentication failed - Invalid token: {}", e.getMessage());
            }
        } else {
            log.debug("No JWT token provided for URI: {}", requestUri);
        }
        chain.doFilter(request, response);
    }
}
