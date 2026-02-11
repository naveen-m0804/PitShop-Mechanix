package com.roadside.model;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.Indexed;

public class RepairRequest {
    
    @Id
    private String id;
    
    @Indexed
    private String clientId; // Reference to User
    
    @Indexed
    private String mechanicShopId; // Reference to MechanicShop
    
    private String mechanicUserId; // Assigned mechanic user ID
    
    private GeoJsonPoint clientLocation;
    
    private String clientAddress;
    
    // De-normalized client details for easier fetching
    private String clientName;
    private String clientPhone;
    
    // De-normalized shop details
    private String shopName;
    private String shopAddress;
    private String shopPhone;
    
    private String vehicleType; // CAR, BIKE
    
    private String problemDescription;
    
    private String aiSuggestion;
    
    private List<String> images;
    
    @Indexed
    private String status; // PENDING, ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED, EXPIRED, SOS_PENDING
    
    private String broadcastId; // Shared ID for broadcasted requests
    
    private String type; // NORMAL or SOS - to track request type
    
    private LocalDateTime acceptedAt;
    
    private List<String> rejectedBy;  // List of mechanic user IDs who rejected
    
    private LocalDateTime completedAt;
    
    private Integer rating;
    
    private String review;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;

    public RepairRequest() {}

    public RepairRequest(String id, String clientId, String mechanicShopId, String mechanicUserId, GeoJsonPoint clientLocation, String clientAddress, String vehicleType, String problemDescription, String aiSuggestion, List<String> images, String status, String type, LocalDateTime acceptedAt, List<String> rejectedBy, LocalDateTime completedAt, Integer rating, String review, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.clientId = clientId;
        this.mechanicShopId = mechanicShopId;
        this.mechanicUserId = mechanicUserId;
        this.clientLocation = clientLocation;
        this.clientAddress = clientAddress;
        this.vehicleType = vehicleType;
        this.problemDescription = problemDescription;
        this.aiSuggestion = aiSuggestion;
        this.images = images;
        this.status = status;
        this.type = type;
        this.acceptedAt = acceptedAt;
        this.rejectedBy = rejectedBy;
        this.completedAt = completedAt;
        this.rating = rating;
        this.review = review;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Manual Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }
    public String getMechanicShopId() { return mechanicShopId; }
    public void setMechanicShopId(String mechanicShopId) { this.mechanicShopId = mechanicShopId; }
    public String getMechanicUserId() { return mechanicUserId; }
    public void setMechanicUserId(String mechanicUserId) { this.mechanicUserId = mechanicUserId; }
    public GeoJsonPoint getClientLocation() { return clientLocation; }
    public void setClientLocation(GeoJsonPoint clientLocation) { this.clientLocation = clientLocation; }
    public String getClientAddress() { return clientAddress; }
    public void setClientAddress(String clientAddress) { this.clientAddress = clientAddress; }
    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }
    public String getClientPhone() { return clientPhone; }
    public void setClientPhone(String clientPhone) { this.clientPhone = clientPhone; }
    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }
    public String getShopAddress() { return shopAddress; }
    public void setShopAddress(String shopAddress) { this.shopAddress = shopAddress; }
    public String getShopPhone() { return shopPhone; }
    public void setShopPhone(String shopPhone) { this.shopPhone = shopPhone; }
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
    public String getProblemDescription() { return problemDescription; }
    public void setProblemDescription(String problemDescription) { this.problemDescription = problemDescription; }
    public String getAiSuggestion() { return aiSuggestion; }
    public void setAiSuggestion(String aiSuggestion) { this.aiSuggestion = aiSuggestion; }
    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getBroadcastId() { return broadcastId; }
    public void setBroadcastId(String broadcastId) { this.broadcastId = broadcastId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public LocalDateTime getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(LocalDateTime acceptedAt) { this.acceptedAt = acceptedAt; }
    public List<String> getRejectedBy() { return rejectedBy; }
    public void setRejectedBy(List<String> rejectedBy) { this.rejectedBy = rejectedBy; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getReview() { return review; }
    public void setReview(String review) { this.review = review; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
