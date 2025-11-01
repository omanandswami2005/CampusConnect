package com.campusconnect.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ClubRegisterRequest {
    @NotBlank
    private String clubName;
    @Email @NotBlank
    private String email;
    @NotBlank
    private String password;
}
