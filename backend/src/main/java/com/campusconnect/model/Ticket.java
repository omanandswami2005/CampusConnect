package com.campusconnect.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tickets")
public class Ticket {
    @Id
    private String id;
    private String eventId;
    private String eventName;
    private String studentName;
    private String email;
    private String bookingTime; // ISO_LOCAL_DATE_TIME
}
