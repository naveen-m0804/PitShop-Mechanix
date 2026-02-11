package com.roadside.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;


public class LocationDTO {
    
    @NotNull(message = "Latitude is required")
    @Min(value = -90, message = "Latitude must be between -90 and 90")
    @Max(value = 90, message = "Latitude must be between -90 and 90")
    private Double latitude;
    
    @NotNull(message = "Longitude is required")
    @Min(value = -180, message = "Longitude must be between -180 and 180")
    @Max(value = 180, message = "Longitude must be between -180 and 180")
    private Double longitude;

    public LocationDTO() {
    }

    public LocationDTO(Double latitude, Double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    // Manual Getters and Setters
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}
