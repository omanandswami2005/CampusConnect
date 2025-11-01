package com.campusconnect.repository;

import com.campusconnect.model.Club;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ClubRepository extends MongoRepository<Club, String> {
    Optional<Club> findByEmail(String email);
    boolean existsByEmail(String email);
}
