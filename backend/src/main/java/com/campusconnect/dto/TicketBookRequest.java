package com.campusconnect.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TicketBookRequest {
    @NotBlank private String eventId;
}
