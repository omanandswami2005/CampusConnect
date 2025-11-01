package com.campusconnect.controller;

import com.campusconnect.dto.EventCreateRequest;
import com.campusconnect.model.Event;
import com.campusconnect.repository.ClubRepository;
import com.campusconnect.repository.EventRepository;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/events")
public class EventController {
    private static final Logger log = LoggerFactory.getLogger(EventController.class);
    
    private final EventRepository eventRepo;
    private final ClubRepository clubRepo;

    public EventController(EventRepository eventRepo, ClubRepository clubRepo) {
        this.eventRepo = eventRepo;
        this.clubRepo = clubRepo;
    }

    @GetMapping
    public ResponseEntity<?> listAll() {
        log.info("Fetching all events");
        var events = eventRepo.findAll();
        log.info("Retrieved {} events", events.size());
        return ResponseEntity.ok(events);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable String id) {
        log.info("Fetching event details - EventId: {}", id);
        Optional<Event> e = eventRepo.findById(id);
        if (e.isPresent()) {
            log.info("Event found - EventId: {}, Name: {}", id, e.get().getName());
            return ResponseEntity.ok(e.get());
        } else {
            log.warn("Event not found - EventId: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody @Valid EventCreateRequest req, Authentication auth) {
        log.info("Event creation request - EventName: {}, Date: {}, Venue: {}", 
                req.getName(), req.getDate(), req.getVenue());
        
        // Prefer clubId from JWT subject if authenticated; fallback to request for non-JWT scenarios
        String clubId = null;
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() != null) {
            clubId = String.valueOf(auth.getPrincipal());
            log.info("Using clubId from JWT token: {}", clubId);
        } else if (req.getClubId() != null && !req.getClubId().isBlank()) {
            clubId = req.getClubId();
            log.info("Using clubId from request body: {}", clubId);
        }

        if (clubId == null || clubId.isBlank()) {
            log.warn("Event creation failed - Missing club identity");
            return ResponseEntity.status(401).body(java.util.Map.of("message", "Unauthorized: missing club identity"));
        }

        var clubOpt = clubRepo.findById(clubId);
        if (clubOpt.isEmpty()) {
            log.warn("Event creation failed - Invalid clubId: {}", clubId);
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Invalid clubId"));
        }
        
        var club = clubOpt.get();
        Event e = new Event(
                null,
                req.getName(),
                req.getDescription(),
                req.getDate(),
                req.getTime(),
                req.getVenue(),
                req.getCapacity(),
                club.getId(),
                club.getClubName()
        );
        e = eventRepo.save(e);
        
        log.info("Event created successfully - EventId: {}, EventName: {}, ClubId: {}, ClubName: {}, Capacity: {}", 
                e.getId(), e.getName(), club.getId(), club.getClubName(), e.getCapacity());
        
        return ResponseEntity.ok(e);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody @Valid EventCreateRequest req, Authentication auth) {
        log.info("Event update request - EventId: {}, EventName: {}", id, req.getName());
        
        // Get clubId from JWT
        String clubId = null;
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() != null) {
            clubId = String.valueOf(auth.getPrincipal());
        }

        if (clubId == null || clubId.isBlank()) {
            log.warn("Event update failed - Unauthorized access for EventId: {}", id);
            return ResponseEntity.status(401).body(java.util.Map.of("message", "Unauthorized"));
        }

        Optional<Event> eventOpt = eventRepo.findById(id);
        if (eventOpt.isEmpty()) {
            log.warn("Event update failed - Event not found: {}", id);
            return ResponseEntity.status(404).body(java.util.Map.of("message", "Event not found"));
        }

        Event event = eventOpt.get();
        
        // Verify the club owns this event
        if (!event.getClubId().equals(clubId)) {
            log.warn("Event update failed - Unauthorized: ClubId {} does not own EventId {}", clubId, id);
            return ResponseEntity.status(403).body(java.util.Map.of("message", "You don't have permission to update this event"));
        }

        // Update event fields
        event.setName(req.getName());
        event.setDescription(req.getDescription());
        event.setDate(req.getDate());
        event.setTime(req.getTime());
        event.setVenue(req.getVenue());
        event.setCapacity(req.getCapacity());
        
        event = eventRepo.save(event);
        
        log.info("Event updated successfully - EventId: {}, EventName: {}, ClubId: {}", 
                event.getId(), event.getName(), clubId);
        
        return ResponseEntity.ok(event);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id, Authentication auth) {
        log.info("Event deletion request - EventId: {}", id);
        
        // Get clubId from JWT
        String clubId = null;
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() != null) {
            clubId = String.valueOf(auth.getPrincipal());
        }

        if (clubId == null || clubId.isBlank()) {
            log.warn("Event deletion failed - Unauthorized access for EventId: {}", id);
            return ResponseEntity.status(401).body(java.util.Map.of("message", "Unauthorized"));
        }

        Optional<Event> eventOpt = eventRepo.findById(id);
        if (eventOpt.isEmpty()) {
            log.warn("Event deletion failed - Event not found: {}", id);
            return ResponseEntity.status(404).body(java.util.Map.of("message", "Event not found"));
        }

        Event event = eventOpt.get();
        
        // Verify the club owns this event
        if (!event.getClubId().equals(clubId)) {
            log.warn("Event deletion failed - Unauthorized: ClubId {} does not own EventId {}", clubId, id);
            return ResponseEntity.status(403).body(java.util.Map.of("message", "You don't have permission to delete this event"));
        }

        eventRepo.deleteById(id);
        
        log.info("Event deleted successfully - EventId: {}, ClubId: {}", id, clubId);
        
        return ResponseEntity.ok(java.util.Map.of("message", "Event deleted successfully"));
    }
}
