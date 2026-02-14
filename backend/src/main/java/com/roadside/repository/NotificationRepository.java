package com.roadside.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.roadside.model.Notification;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    
    Long countByUserIdAndIsRead(String userId, Boolean isRead);

    void deleteByUserId(String userId);
}
