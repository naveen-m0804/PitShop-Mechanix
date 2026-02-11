package com.roadside.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;


import java.util.List;

public class CreateRequestDTO {
    
    private String mechanicShopId;
    
    @NotNull(message = "Client location is required")
    @Valid
    private LocationDTO clientLocation;
    
    private String clientAddress;
    
    @NotBlank(message = "Vehicle type is required")
    @Pattern(regexp = "CAR|BIKE|TWO_WHEELER|FOUR_WHEELER", message = "Vehicle type must be CAR, BIKE, TWO_WHEELER or FOUR_WHEELER")
    private String vehicleType;
    
    @Pattern(regexp = "NORMAL|SOS", message = "Request type must be NORMAL or SOS")
    private String type;
    
    @Size(max = 500, message = "Problem description must not exceed 500 characters")
    private String problemDescription;
    
    private String aiSuggestion;
    
    private List<String> images;
    
    private String broadcastId; // Optional, strict only if part of broadcast

    public CreateRequestDTO() {
    }

    public CreateRequestDTO(String mechanicShopId, LocationDTO clientLocation, String clientAddress, String vehicleType, String problemDescription, String aiSuggestion, List<String> images) {
        this.mechanicShopId = mechanicShopId;
        this.clientLocation = clientLocation;
        this.clientAddress = clientAddress;
        this.vehicleType = vehicleType;
        this.problemDescription = problemDescription;
        this.aiSuggestion = aiSuggestion;
        this.images = images;
    }

    public String getMechanicShopId() {
        return mechanicShopId;
    }

    public void setMechanicShopId(String mechanicShopId) {
        this.mechanicShopId = mechanicShopId;
    }

    public LocationDTO getClientLocation() {
        return clientLocation;
    }

    public void setClientLocation(LocationDTO clientLocation) {
        this.clientLocation = clientLocation;
    }

    public String getClientAddress() {
        return clientAddress;
    }

    public void setClientAddress(String clientAddress) {
        this.clientAddress = clientAddress;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public String getProblemDescription() {
        return problemDescription;
    }

    public void setProblemDescription(String problemDescription) {
        this.problemDescription = problemDescription;
    }

    public String getAiSuggestion() {
        return aiSuggestion;
    }

    public void setAiSuggestion(String aiSuggestion) {
        this.aiSuggestion = aiSuggestion;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getBroadcastId() {
        return broadcastId;
    }

    public void setBroadcastId(String broadcastId) {
        this.broadcastId = broadcastId;
    }
}
    