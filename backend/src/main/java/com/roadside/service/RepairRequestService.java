package com.roadside.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.roadside.model.RepairRequest;
import com.roadside.repository.RepairRequestRepository;

@Service
public class RepairRequestService {
    
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(RepairRequestService.class);
    
    private final RepairRequestRepository repairRequestRepository;
    private final com.roadside.repository.UserRepository userRepository;
    private final com.roadside.service.NotificationService notificationService;
    private final com.roadside.repository.MechanicShopRepository mechanicShopRepository;
    private final WebSocketService webSocketService;
    
    // Manual constructor since Lombok seems to be having issues in this environment
    public RepairRequestService(RepairRequestRepository repairRequestRepository,
                                com.roadside.repository.UserRepository userRepository,
                                com.roadside.service.NotificationService notificationService,
                                com.roadside.repository.MechanicShopRepository mechanicShopRepository,
                                WebSocketService webSocketService) {
        this.repairRequestRepository = repairRequestRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.mechanicShopRepository = mechanicShopRepository;
        this.webSocketService = webSocketService;
    }
    
    @Transactional
    public RepairRequest createRequest(RepairRequest request) {
        // Populate client details from User repository
        if (request.getClientId() != null) {
            userRepository.findById(java.util.Objects.requireNonNull(request.getClientId())).ifPresent(user -> {
                request.setClientName(user.getName());
                request.setClientPhone(user.getPhone());
                // Add default image if needed? No, strict fields only.
            });
        }

        // Populate Shop details
        com.roadside.model.MechanicShop shop = null;
        if (request.getMechanicShopId() != null) {
            shop = mechanicShopRepository.findById(java.util.Objects.requireNonNull(request.getMechanicShopId())).orElse(null);
            if (shop != null) {
                request.setShopName(shop.getShopName());
                request.setShopAddress(shop.getAddress());
                request.setShopPhone(shop.getPhone());
            }
        }

        // Set default values
        request.setStatus("PENDING");
        request.setCreatedAt(LocalDateTime.now());
        
        // Ensure broadcastId is preserved from DTO (it should be set by Controller mapping)
        // If not mapped automatically, we might need to handle it.
        // But since we are receiving RepairRequest object here (controller maps DTO to Entity), 
        // we just need to ensure the Controller maps it.
        // Let's verify RepairRequestService just saves what it gets.
        // Adding a log to confirm.
        if (request.getBroadcastId() != null) {
             log.info("Processing broadcast request: {}", request.getBroadcastId());
        }
        
        // Log client location for debugging
        if (request.getClientLocation() != null) {
            log.info("Creating request with client location: {} (Type: {})", 
                request.getClientLocation().getCoordinates(), 
                request.getClientLocation().getType());
        } else {
            log.warn("Creating request WITHOUT client location! This should not happen for new requests.");
        }
        
        // Save request
        RepairRequest savedRequest = repairRequestRepository.save(request);
        log.info("Created repair request: {} with status: {}", savedRequest.getId(), savedRequest.getStatus());
        
        // Verify location was saved
        if (savedRequest.getClientLocation() != null) {
            log.info("Saved request {} has client location: {}", 
                savedRequest.getId(), savedRequest.getClientLocation().getCoordinates());
        } else {
            log.error("CRITICAL: Saved request {} is MISSING client location after save!", savedRequest.getId());
        }
        
        // Notify Mechanic
        if (shop != null) {
            try {
                String mechanicId = shop.getUserId();
                if (mechanicId != null) {
                    // 1. Create DB Notification
                    try {
                        notificationService.createNotification(
                            mechanicId,
                            "NEW_REQUEST",
                            "New Repair Request",
                            "You have a new " + request.getVehicleType() + " repair request.",
                            savedRequest.getId()
                        );
                    } catch (Exception e) {
                        log.error("Failed to create DB notification for mechanic: {}", mechanicId, e);
                    }

                    // 2. Send WebSocket Notification
                    try {
                        log.info("Attempting to send NEW_REQUEST WebSocket to user: {}", mechanicId);
                        webSocketService.sendToUser(mechanicId, "NEW_REQUEST", savedRequest);
                        log.info("Successfully initiated NEW_REQUEST WebSocket to user: {}", mechanicId);
                    } catch (Exception e) {
                        log.error("Failed to send WebSocket notification to mechanic: {}", mechanicId, e);
                    }
                } else {
                    log.warn("Shop {} has no associated userId", shop.getShopName());
                }
            } catch (Exception e) {
                log.error("Error in notification logic", e);
            }
        } else {
            log.info("No specific shop assigned for request {}, skipping direct notification.", savedRequest.getId());
        }
        
        return savedRequest;
    }
}
