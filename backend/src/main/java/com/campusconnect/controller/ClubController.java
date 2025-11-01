package com.campusconnect.controller;

import com.campusconnect.dto.*;
import com.campusconnect.model.Club;
import com.campusconnect.repository.ClubRepository;
import com.campusconnect.security.JwtService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/clubs")
public class ClubController {
    private static final Logger log = LoggerFactory.getLogger(ClubController.class);
    
    private final ClubRepository clubRepo;
    private final BCryptPasswordEncoder encoder;
    private final JwtService jwtService;

    public ClubController(ClubRepository clubRepo, BCryptPasswordEncoder encoder, JwtService jwtService) {
        this.clubRepo = clubRepo;
        this.encoder = encoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid ClubRegisterRequest req) {
        log.info("Club registration attempt - Email: {}, ClubName: {}", req.getEmail(), req.getClubName());
        
        if (clubRepo.existsByEmail(req.getEmail())) {
            log.warn("Registration failed - Email already exists: {}", req.getEmail());
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
        }
        
        Club club = new Club(null, req.getClubName(), req.getEmail(), encoder.encode(req.getPassword()));
        club = clubRepo.save(club);
        String token = jwtService.generateToken(club);
        
        log.info("Club registered successfully - ClubId: {}, Email: {}, ClubName: {}", 
                club.getId(), club.getEmail(), club.getClubName());
        
        return ResponseEntity.ok(Map.of(
                "clubId", club.getId(),
                "clubName", club.getClubName(),
                "email", club.getEmail(),
                "token", token,
                "role", "club"
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid ClubLoginRequest req) {
        log.info("Club login attempt - Email: {}", req.getEmail());
        
        var clubOpt = clubRepo.findByEmail(req.getEmail());
        if (clubOpt.isEmpty() || !encoder.matches(req.getPassword(), clubOpt.get().getPassword())) {
            log.warn("Login failed - Invalid credentials for email: {}", req.getEmail());
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        }
        
        var club = clubOpt.get();
        String token = jwtService.generateToken(club);
        
        log.info("Club logged in successfully - ClubId: {}, Email: {}, ClubName: {}", 
                club.getId(), club.getEmail(), club.getClubName());
        
        return ResponseEntity.ok(Map.of(
                "clubId", club.getId(),
                "clubName", club.getClubName(),
                "email", club.getEmail(),
                "token", token,
                "role", "club"
        ));
    }
}
