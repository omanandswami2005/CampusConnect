package com.campusconnect.security;

import com.campusconnect.model.Club;
import com.campusconnect.model.Student;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {
    private final Key key;
    private final long expirationMs;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.expirationMs = expirationMs;
    }

    public String generateToken(Club club) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(club.getId()) // use clubId as subject
                .claim("clubName", club.getClubName())
                .claim("email", club.getEmail())
                .claim("role", "club")
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + expirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateTokenForStudent(Student student) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(student.getId()) // use studentId as subject
                .claim("name", student.getName())
                .claim("rbtNumber", student.getRbtNumber())
                .claim("email", student.getEmail())
                .claim("role", "student")
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + expirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Jws<Claims> parse(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
    }
}
