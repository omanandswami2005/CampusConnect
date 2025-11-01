package com.campusconnect.controller;

import com.campusconnect.dto.TicketBookRequest;
import com.campusconnect.model.Ticket;
import com.campusconnect.repository.EventRepository;
import com.campusconnect.repository.StudentRepository;
import com.campusconnect.repository.TicketRepository;
import com.campusconnect.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/tickets")
public class TicketController {
    private static final Logger log = LoggerFactory.getLogger(TicketController.class);
    
    private final TicketRepository ticketRepo;
    private final EventRepository eventRepo;
    private final StudentRepository studentRepo;
    private final JwtService jwtService;

    public TicketController(TicketRepository ticketRepo, EventRepository eventRepo, 
                           StudentRepository studentRepo, JwtService jwtService) {
        this.ticketRepo = ticketRepo;
        this.eventRepo = eventRepo;
        this.studentRepo = studentRepo;
        this.jwtService = jwtService;
    }

    @PostMapping("/book")
    public ResponseEntity<?> book(@RequestBody @Valid TicketBookRequest req, HttpServletRequest request) {
        log.info("Ticket booking request - EventId: {}", req.getEventId());
        
        // Extract JWT token from Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Ticket booking failed - No valid JWT token provided");
            return ResponseEntity.status(401).body(java.util.Map.of("message", "Authentication required"));
        }
        
        String token = authHeader.substring(7);
        
        try {
            // Parse JWT token to get student info
            var claims = jwtService.parse(token).getBody();
            String studentId = claims.getSubject();
            String role = claims.get("role", String.class);
            
            // Verify user is a student
            if (!"student".equals(role)) {
                log.warn("Ticket booking failed - User is not a student. Role: {}", role);
                return ResponseEntity.status(403).body(java.util.Map.of("message", "Only students can book tickets"));
            }
            
            // Get full student details from database
            var studentOpt = studentRepo.findById(studentId);
            if (studentOpt.isEmpty()) {
                log.warn("Ticket booking failed - Student not found in database. StudentId: {}", studentId);
                return ResponseEntity.status(404).body(java.util.Map.of("message", "Student not found"));
            }
            var student = studentOpt.get();
            
            log.info("Ticket booking request - EventId: {}, StudentId: {}, StudentName: {}, Email: {}", 
                    req.getEventId(), student.getId(), student.getName(), student.getEmail());
            
            // Check if event exists
            var evtOpt = eventRepo.findById(req.getEventId());
            if (evtOpt.isEmpty()) {
                log.warn("Ticket booking failed - Invalid eventId: {}", req.getEventId());
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "Invalid eventId"));
            }
            var evt = evtOpt.get();

            // Check if student already has a ticket for this event
            var existingTickets = ticketRepo.findByEventIdAndEmail(evt.getId(), student.getEmail());
            if (!existingTickets.isEmpty()) {
                log.warn("Ticket booking failed - Student already has a ticket for this event. EventId: {}, Email: {}", 
                        evt.getId(), student.getEmail());
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "You already have a ticket for this event"));
            }

            // Check event capacity
            long booked = ticketRepo.countByEventId(evt.getId());
            log.info("Current bookings for event '{}': {}/{}", evt.getName(), booked, evt.getCapacity());
            
            if (evt.getCapacity() != null && booked >= evt.getCapacity()) {
                log.warn("Ticket booking failed - Event '{}' is fully booked ({}/{})", 
                        evt.getName(), booked, evt.getCapacity());
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "Event is fully booked"));
            }

            // Create and save ticket
            var ticket = new Ticket(
                    null,
                    evt.getId(),
                    evt.getName(),
                    student.getName(),
                    student.getEmail(),
                    LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
            );
            ticket = ticketRepo.save(ticket);
            
            log.info("Ticket booked successfully - TicketId: {}, EventId: {}, EventName: {}, Student: {}, Email: {}", 
                    ticket.getId(), evt.getId(), evt.getName(), student.getName(), student.getEmail());
            
            return ResponseEntity.ok(ticket);
            
        } catch (Exception e) {
            log.error("Ticket booking failed - JWT parsing error: {}", e.getMessage());
            return ResponseEntity.status(401).body(java.util.Map.of("message", "Invalid authentication token"));
        }
    }

    @GetMapping("/my-tickets")
    public ResponseEntity<?> getMyTickets(HttpServletRequest request) {
        // Extract JWT token from Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Get my tickets failed - No valid JWT token provided");
            return ResponseEntity.status(401).body(java.util.Map.of("message", "Authentication required"));
        }
        
        String token = authHeader.substring(7);
        
        try {
            // Parse JWT token to get student info
            var claims = jwtService.parse(token).getBody();
            String studentId = claims.getSubject();
            String role = claims.get("role", String.class);
            
            // Verify user is a student
            if (!"student".equals(role)) {
                log.warn("Get my tickets failed - User is not a student. Role: {}", role);
                return ResponseEntity.status(403).body(java.util.Map.of("message", "Only students can view their tickets"));
            }
            
            // Get student email from database
            var studentOpt = studentRepo.findById(studentId);
            if (studentOpt.isEmpty()) {
                log.warn("Get my tickets failed - Student not found in database. StudentId: {}", studentId);
                return ResponseEntity.status(404).body(java.util.Map.of("message", "Student not found"));
            }
            
            String email = studentOpt.get().getEmail();
            log.info("Fetching tickets for student: {} ({})", studentId, email);
            var tickets = ticketRepo.findByEmail(email);
            log.info("Found {} tickets for student: {}", tickets.size(), email);
            return ResponseEntity.ok(tickets);
            
        } catch (Exception e) {
            log.error("Get my tickets failed - JWT parsing error: {}", e.getMessage());
            return ResponseEntity.status(401).body(java.util.Map.of("message", "Invalid authentication token"));
        }
    }

    @GetMapping("/event/{eventId}/attendees")
    public ResponseEntity<?> getEventAttendees(@PathVariable String eventId) {
        log.info("Fetching attendees for event: {}", eventId);
        
        var evtOpt = eventRepo.findById(eventId);
        if (evtOpt.isEmpty()) {
            log.warn("Event not found: {}", eventId);
            return ResponseEntity.notFound().build();
        }
        
        var tickets = ticketRepo.findByEventId(eventId);
        log.info("Found {} attendees for event '{}'", tickets.size(), evtOpt.get().getName());
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/export/{eventId}")
    public void export(@PathVariable String eventId, HttpServletResponse response) {
        log.info("Ticket export request - EventId: {}", eventId);
        
        var evtOpt = eventRepo.findById(eventId);
        if (evtOpt.isEmpty()) {
            log.warn("Ticket export failed - Event not found: {}", eventId);
            response.setStatus(404);
            return;
        }
        var evt = evtOpt.get();
        var tickets = ticketRepo.findByEventId(eventId);
        
        log.info("Exporting {} tickets for event '{}' (EventId: {})", 
                tickets.size(), evt.getName(), eventId);

        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Tickets");
            int rowIdx = 0;
            Row header = sheet.createRow(rowIdx++);
            String[] cols = {"Ticket ID", "Event ID", "Event Name", "Student Name", "Email", "Booking Time"};
            for (int i = 0; i < cols.length; i++) header.createCell(i).setCellValue(cols[i]);

            for (var t : tickets) {
                Row r = sheet.createRow(rowIdx++);
                r.createCell(0).setCellValue(t.getId());
                r.createCell(1).setCellValue(t.getEventId());
                r.createCell(2).setCellValue(t.getEventName());
                r.createCell(3).setCellValue(t.getStudentName());
                r.createCell(4).setCellValue(t.getEmail());
                r.createCell(5).setCellValue(t.getBookingTime());
            }
            for (int i = 0; i < cols.length; i++) sheet.autoSizeColumn(i);

            String filename = "event-" + URLEncoder.encode(evt.getName().replace(" ", "_"), StandardCharsets.UTF_8) + "-tickets.xlsx";
            response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            wb.write(response.getOutputStream());
            response.flushBuffer();
            
            log.info("Ticket export completed successfully - EventId: {}, EventName: {}, TicketCount: {}", 
                    eventId, evt.getName(), tickets.size());
            
        } catch (Exception ex) {
            log.error("Ticket export failed - EventId: {}, Error: {}", eventId, ex.getMessage(), ex);
            response.setStatus(500);
        }
    }

    @DeleteMapping("/{ticketId}")
    public ResponseEntity<?> cancelTicket(@PathVariable String ticketId, HttpServletRequest request) {
        log.info("Ticket cancellation request - TicketId: {}", ticketId);
        
        // Extract JWT token from Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Ticket cancellation failed - No valid JWT token provided");
            return ResponseEntity.status(401).body(java.util.Map.of("message", "Authentication required"));
        }
        
        String token = authHeader.substring(7);
        
        try {
            // Parse JWT token to get student info
            var claims = jwtService.parse(token).getBody();
            String studentId = claims.getSubject();
            String role = claims.get("role", String.class);
            
            // Verify user is a student
            if (!"student".equals(role)) {
                log.warn("Ticket cancellation failed - User is not a student. Role: {}", role);
                return ResponseEntity.status(403).body(java.util.Map.of("message", "Only students can cancel tickets"));
            }
            
            // Get student email from database
            var studentOpt = studentRepo.findById(studentId);
            if (studentOpt.isEmpty()) {
                log.warn("Ticket cancellation failed - Student not found in database. StudentId: {}", studentId);
                return ResponseEntity.status(404).body(java.util.Map.of("message", "Student not found"));
            }
            
            String email = studentOpt.get().getEmail();
            
            var ticketOpt = ticketRepo.findById(ticketId);
            if (ticketOpt.isEmpty()) {
                log.warn("Ticket cancellation failed - Ticket not found: {}", ticketId);
                return ResponseEntity.status(404).body(java.util.Map.of("message", "Ticket not found"));
            }

            var ticket = ticketOpt.get();
            
            // Verify the ticket belongs to the authenticated student
            if (!ticket.getEmail().equalsIgnoreCase(email)) {
                log.warn("Ticket cancellation failed - Email mismatch. TicketId: {}, StudentEmail: {}, TicketEmail: {}", 
                        ticketId, email, ticket.getEmail());
                return ResponseEntity.status(403).body(java.util.Map.of("message", "You don't have permission to cancel this ticket"));
            }

            ticketRepo.deleteById(ticketId);
            
            log.info("Ticket cancelled successfully - TicketId: {}, EventId: {}, EventName: {}, Email: {}", 
                    ticketId, ticket.getEventId(), ticket.getEventName(), email);
            
            return ResponseEntity.ok(java.util.Map.of("message", "Ticket cancelled successfully"));
            
        } catch (Exception e) {
            log.error("Ticket cancellation failed - JWT parsing error: {}", e.getMessage());
            return ResponseEntity.status(401).body(java.util.Map.of("message", "Invalid authentication token"));
        }
    }
}
