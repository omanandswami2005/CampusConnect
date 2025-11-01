package com.campusconnect.repository;

import com.campusconnect.model.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByEventId(String eventId);
    List<Ticket> findByEmail(String email);
    List<Ticket> findByEventIdAndEmail(String eventId, String email);
    long countByEventId(String eventId);
}
