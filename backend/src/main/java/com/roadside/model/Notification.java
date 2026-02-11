package com.roadside.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notifications")
public class Notification {
    
    @Id
    private String id;
    
    private String userId;              // Recipient user ID
    
    private String type;                // REQUEST_ACCEPTED, REQUEST_REJECTED, etc.
    
    private String title;
    
    private String message;
    
    private String requestId;           // Related repair request ID
    
    private Boolean isRead = false;
    
    @CreatedDate
    private LocalDateTime createdAt;

    public Notification() {}

    public Notification(String id, String userId, String type, String title, String message, String requestId, Boolean isRead, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.type = type;
        this.title = title;
        this.message = message;
        this.requestId = requestId;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
