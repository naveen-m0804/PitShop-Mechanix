package com.roadside.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.roadside.model.Notification;
import com.roadside.repository.NotificationRepository;

@Service
public class NotificationService {
    
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    
    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    
    public Notification createNotification(
            String userId, 
            String type, 
            String title, 
            String message, 
            String requestId
    ) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRequestId(requestId);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        
        log.info("Creating notification for user: {}, type: {}", userId, type);
        return notificationRepository.save(notification);
    }
    
    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public Long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }
    
    public Notification markAsRead(String notificationId) {
        java.util.Objects.requireNonNull(notificationId, "notificationId must not be null");
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(String userId) {
        List<Notification> userNotifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        userNotifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(userNotifications);
    }
}
