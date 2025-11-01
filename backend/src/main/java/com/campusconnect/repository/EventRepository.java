package com.campusconnect.repository;

import com.campusconnect.model.Event;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface EventRepository extends MongoRepository<Event, String> {
    List<Event> findByClubId(String clubId);
}
