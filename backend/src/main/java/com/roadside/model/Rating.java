package com.roadside.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "ratings")
public class Rating {
    
    @Id
    private String id;
    
    private String userId;              // Client who rated
    
    private String mechanicShopId;
    
    private Integer rating;             // 1-5 stars
    
    private String requestId;           // Optional: link to completed request
    
    private LocalDateTime createdAt;

    public Rating() {}

    public Rating(String id, String userId, String mechanicShopId, Integer rating, String requestId, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.mechanicShopId = mechanicShopId;
        this.rating = rating;
        this.requestId = requestId;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getMechanicShopId() { return mechanicShopId; }
    public void setMechanicShopId(String mechanicShopId) { this.mechanicShopId = mechanicShopId; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
