package com.campusconnect.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "events")
public class Event {
    @Id
    private String id;
    private String name;
    private String description;
    private String date;   // YYYY-MM-DD
    private String time;   // HH:mm
    private String venue;
    private Integer capacity;
    private String clubId;
    private String clubName;
}
