package com.campusconnect.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StudentRegisterRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String rbtNumber;
    @Email @NotBlank
    private String email;
    @NotBlank
    private String password;
}
