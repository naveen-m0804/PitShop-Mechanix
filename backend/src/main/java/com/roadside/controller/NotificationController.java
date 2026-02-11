package com.roadside.controller;

import java.util.List;

// Controller for Notifications

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.roadside.dto.ApiResponse;
import com.roadside.model.Notification;
import com.roadside.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class NotificationController {
    
    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);
    
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(Authentication authentication) {
        try {
            String userId = authentication.getName();
            log.info("Fetching notifications for user: {}", userId);
            List<Notification> notifications = notificationService.getUserNotifications(userId);
            return ResponseEntity.ok(ApiResponse.success(notifications));
        } catch (Exception e) {
            log.error("Error fetching notifications", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch notifications: " + e.getMessage()));
        }
    }
    
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Authentication authentication) {
        try {
            String userId = authentication.getName();
            Long count = notificationService.getUnreadCount(userId);
            return ResponseEntity.ok(ApiResponse.success(count));
        } catch (Exception e) {
            log.error("Error fetching unread count", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch unread count: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Notification>> markAsRead(
            @PathVariable String id,
            Authentication authentication
    ) {
        try {
            Notification notification = notificationService.markAsRead(id);
            return ResponseEntity.ok(ApiResponse.success(notification));
        } catch (Exception e) {
            log.error("Error marking notification as read", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update notification: " + e.getMessage()));
        }
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication authentication) {
        try {
            String userId = authentication.getName();
            notificationService.markAllAsRead(userId);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            log.error("Error marking all notifications as read", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to mark all as read: " + e.getMessage()));
        }
    }
}
