package com.roadside.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class FirebaseLoginRequest {
    @NotBlank(message = "ID Token is required")
    private String idToken;
    private String role; // Optional, only for registration
    private String name; // Optional, from Firebase match
    private String email; 

    public FirebaseLoginRequest() {}

    public String getIdToken() { return idToken; }
    public void setIdToken(String idToken) { this.idToken = idToken; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
