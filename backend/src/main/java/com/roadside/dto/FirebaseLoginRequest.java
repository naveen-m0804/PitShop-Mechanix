package com.roadside.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FirebaseLoginRequest {
    @NotBlank(message = "ID Token is required")
    private String idToken;
    private String role; // Optional, only for registration
    private String name; // Optional, from Firebase match
    private String email; 
}
