package com.campusconnect.repository;

import com.campusconnect.model.Student;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface StudentRepository extends MongoRepository<Student, String> {
    Optional<Student> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByRbtNumber(String rbtNumber);
}
