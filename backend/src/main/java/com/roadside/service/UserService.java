package com.roadside.service;

import com.roadside.model.*;
import com.roadside.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final RepairRequestRepository repairRequestRepository;
    private final MechanicShopRepository mechanicShopRepository;
    private final RatingRepository ratingRepository;
    private final NotificationRepository notificationRepository;
    private final LocationTrackingRepository locationTrackingRepository;

    public UserService(UserRepository userRepository, 
                       RepairRequestRepository repairRequestRepository,
                       MechanicShopRepository mechanicShopRepository,
                       RatingRepository ratingRepository,
                       NotificationRepository notificationRepository,
                       LocationTrackingRepository locationTrackingRepository) {
        this.userRepository = userRepository;
        this.repairRequestRepository = repairRequestRepository;
        this.mechanicShopRepository = mechanicShopRepository;
        this.ratingRepository = ratingRepository;
        this.notificationRepository = notificationRepository;
        this.locationTrackingRepository = locationTrackingRepository;
    }

    @Transactional
    public void deleteUser(String userId) {
        log.info("Starting deletion process for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Delete Repair Requests
        // Delete requests where user is client
        log.info("Deleting client requests for user: {}", userId);
        repairRequestRepository.deleteByClientId(userId);
        
        // Delete requests where user is mechanic
        log.info("Deleting mechanic requests for user: {}", userId);
        repairRequestRepository.deleteByMechanicUserId(userId);

        // 2. Delete Mechanic Shop (if exists) and its ratings
        mechanicShopRepository.findByUserId(userId).ifPresent(shop -> {
            log.info("Deleting shop ratings for shop: {}", shop.getId());
            ratingRepository.deleteByMechanicShopId(shop.getId());
            
            log.info("Deleting shop: {}", shop.getId());
            mechanicShopRepository.delete(shop);
        });

        // 3. Delete Ratings made by this user
        log.info("Deleting ratings made by user: {}", userId);
        ratingRepository.deleteByUserId(userId);

        // 4. Delete Notifications for this user
        log.info("Deleting notifications for user: {}", userId);
        notificationRepository.deleteByUserId(userId);

        // 5. Delete Location Tracking
        log.info("Deleting location tracking for user: {}", userId);
        locationTrackingRepository.deleteByMechanicUserId(userId);

        // 6. Delete User
        log.info("Deleting user: {}", userId);
        userRepository.delete(user);
        
        log.info("User deletion completed successfully for: {}", userId);
    }
}
