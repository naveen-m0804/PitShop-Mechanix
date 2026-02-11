package com.roadside.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
public class UpdateProfileRequest {
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String phone;

    public UpdateProfileRequest() {}

    public UpdateProfileRequest(String name, String phone) {
        this.name = name;
        this.phone = phone;
    }

    // Manual Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
