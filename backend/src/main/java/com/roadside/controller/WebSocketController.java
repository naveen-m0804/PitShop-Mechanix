package com.roadside.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import com.roadside.model.LocationTracking;
import com.roadside.repository.LocationTrackingRepository;
import com.roadside.service.WebSocketService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {
    
    private final WebSocketService webSocketService;
    private final LocationTrackingRepository locationTrackingRepository;
    
    @MessageMapping("/location-update")
    public void handleLocationUpdate(
            @Payload Map<String, Object> payload,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        try {
            String requestId = (String) payload.get("requestId");
            String mechanicUserId = (String) payload.get("mechanicUserId");
            
            @SuppressWarnings("unchecked")
            Map<String, Double> location = (Map<String, Double>) payload.get("location");
            Double latitude = location.get("latitude");
            Double longitude = location.get("longitude");
            
            Double speed = payload.get("speed") != null ? 
                ((Number) payload.get("speed")).doubleValue() : null;
            Double heading = payload.get("heading") != null ? 
                ((Number) payload.get("heading")).doubleValue() : null;
            
            // Save location tracking
            LocationTracking tracking = new LocationTracking();
            tracking.setRequestId(requestId);
            tracking.setMechanicUserId(mechanicUserId);
            tracking.setLocation(new GeoJsonPoint(longitude, latitude));
            tracking.setTimestamp(LocalDateTime.now());
            tracking.setSpeed(speed);
            tracking.setHeading(heading);
            
            locationTrackingRepository.save(tracking);
            
            // Broadcast location update
            Map<String, Object> updateData = new HashMap<>();
            updateData.put("requestId", requestId);
            updateData.put("location", Map.of("latitude", latitude, "longitude", longitude));
            updateData.put("speed", speed);
            updateData.put("heading", heading);
            updateData.put("timestamp", System.currentTimeMillis());
            
            webSocketService.sendLocationUpdate(requestId, updateData);
            
            log.debug("Location update received for request: {}", requestId);
        } catch (Exception e) {
            log.error("Error handling location update: {}", e.getMessage());
        }
    }
    
    @MessageMapping("/subscribe")
    public void handleSubscription(
            @Payload Map<String, String> payload,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        String userId = payload.get("userId");
        log.info("User {} subscribed to WebSocket", userId);
    }
}
