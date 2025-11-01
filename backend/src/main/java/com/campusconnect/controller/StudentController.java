package com.campusconnect.controller;

import com.campusconnect.dto.StudentLoginRequest;
import com.campusconnect.dto.StudentRegisterRequest;
import com.campusconnect.model.Student;
import com.campusconnect.repository.StudentRepository;
import com.campusconnect.security.JwtService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/students")
public class StudentController {
    private static final Logger log = LoggerFactory.getLogger(StudentController.class);
    
    private final StudentRepository studentRepo;
    private final BCryptPasswordEncoder encoder;
    private final JwtService jwtService;

    public StudentController(StudentRepository studentRepo, BCryptPasswordEncoder encoder, JwtService jwtService) {
        this.studentRepo = studentRepo;
        this.encoder = encoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid StudentRegisterRequest req) {
        log.info("Student registration attempt - Email: {}, RBT: {}, Name: {}", 
                req.getEmail(), req.getRbtNumber(), req.getName());
        
        if (studentRepo.existsByEmail(req.getEmail())) {
            log.warn("Registration failed - Email already exists: {}", req.getEmail());
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
        }
        
        if (studentRepo.existsByRbtNumber(req.getRbtNumber())) {
            log.warn("Registration failed - RBT number already exists: {}", req.getRbtNumber());
            return ResponseEntity.badRequest().body(Map.of("message", "RBT number already registered"));
        }
        
        Student student = new Student(null, req.getName(), req.getRbtNumber(), 
                req.getEmail(), encoder.encode(req.getPassword()));
        student = studentRepo.save(student);
        String token = jwtService.generateTokenForStudent(student);
        
        log.info("Student registered successfully - StudentId: {}, Email: {}, RBT: {}, Name: {}", 
                student.getId(), student.getEmail(), student.getRbtNumber(), student.getName());
        
        return ResponseEntity.ok(Map.of(
                "studentId", student.getId(),
                "name", student.getName(),
                "rbtNumber", student.getRbtNumber(),
                "email", student.getEmail(),
                "token", token,
                "role", "student"
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid StudentLoginRequest req) {
        log.info("Student login attempt - Email: {}", req.getEmail());
        
        var studentOpt = studentRepo.findByEmail(req.getEmail());
        if (studentOpt.isEmpty() || !encoder.matches(req.getPassword(), studentOpt.get().getPassword())) {
            log.warn("Login failed - Invalid credentials for email: {}", req.getEmail());
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        }
        
        var student = studentOpt.get();
        String token = jwtService.generateTokenForStudent(student);
        
        log.info("Student logged in successfully - StudentId: {}, Email: {}, RBT: {}, Name: {}", 
                student.getId(), student.getEmail(), student.getRbtNumber(), student.getName());
        
        return ResponseEntity.ok(Map.of(
                "studentId", student.getId(),
                "name", student.getName(),
                "rbtNumber", student.getRbtNumber(),
                "email", student.getEmail(),
                "token", token,
                "role", "student"
        ));
    }
}
