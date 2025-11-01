package com.campusconnect.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class EventCreateRequest {
    @NotBlank private String name;
    @NotBlank private String description;
    @NotBlank private String date;
    @NotBlank private String time;
    @NotBlank private String venue;
    @NotNull @Min(1) private Integer capacity;
    // Optional: when using JWT, clubId comes from the authenticated principal.
    // Do not enforce validation here to allow frontend to omit it.
    private String clubId;
}
