package com.roadside.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class WebSocketService {
    
    private static final Logger log = LoggerFactory.getLogger(WebSocketService.class);
    
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }
    
    public void sendToUser(String userId, String eventType, Object data) {
        if (userId == null) {
            log.warn("Cannot send WebSocket message: userId is null");
            return;
        }
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", eventType);
            message.put("data", data);
            message.put("timestamp", System.currentTimeMillis());
            
            messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/notifications",
                message
            );
            
            log.debug("WebSocket message sent to user {}: {}", userId, eventType);
        } catch (Exception e) {
            log.error("Failed to send WebSocket message to user {}: {}", userId, e.getMessage());
        }
    }
    
    public void broadcast(String destination, @org.springframework.lang.NonNull Object message) {
        java.util.Objects.requireNonNull(destination, "destination must not be null");
        java.util.Objects.requireNonNull(message, "message must not be null");
        try {
            messagingTemplate.convertAndSend(destination, message);
            log.debug("WebSocket broadcast sent to: {}", destination);
        } catch (Exception e) {
            log.error("Failed to broadcast WebSocket message: {}", e.getMessage());
        }
    }
    
    public void sendLocationUpdate(String requestId, @org.springframework.lang.NonNull Map<String, Object> locationData) {
        java.util.Objects.requireNonNull(locationData, "locationData must not be null");
        messagingTemplate.convertAndSend(
            "/topic/location/" + requestId,
            locationData
        );
    }
}
