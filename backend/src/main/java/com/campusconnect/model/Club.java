package com.campusconnect.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "clubs")
public class Club {
    @Id
    private String id;
    private String clubName;
    private String email;
    private String password; // hashed
}
