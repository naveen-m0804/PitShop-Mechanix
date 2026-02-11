package com.roadside.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.roadside.dto.CreateShopRequest;
import com.roadside.model.MechanicShop;
import com.roadside.model.RepairRequest;
import com.roadside.repository.MechanicShopRepository;
import com.roadside.repository.RepairRequestRepository;

@Service
public class MechanicService {
    
    private static final Logger log = LoggerFactory.getLogger(MechanicService.class);
    
    private final MechanicShopRepository mechanicShopRepository;
    private final RepairRequestRepository repairRequestRepository;
    private final WebSocketService webSocketService;
    private final NotificationService notificationService;

    // Manual Constructor for Dependency Injection
    public MechanicService(MechanicShopRepository mechanicShopRepository,
                         RepairRequestRepository repairRequestRepository,
                         WebSocketService webSocketService,
                         NotificationService notificationService) {
        this.mechanicShopRepository = mechanicShopRepository;
        this.repairRequestRepository = repairRequestRepository;
        this.webSocketService = webSocketService;
        this.notificationService = notificationService;
    }
    
    public MechanicShop createShop(String userId, CreateShopRequest request) {
        // Check if user already has a shop
        mechanicShopRepository.findByUserId(userId).ifPresent(shop -> {
            throw new RuntimeException("User already has a mechanic shop");
        });
        
        MechanicShop shop = new MechanicShop();
        shop.setUserId(userId);
        shop.setShopName(request.getShopName());
        shop.setPhone(request.getPhone());
        if (request.getLocation() != null) {
            shop.setLocation(new GeoJsonPoint(
                request.getLocation().getLongitude(),
                request.getLocation().getLatitude()
            ));
        }
        shop.setAddress(request.getAddress());
        shop.setShopTypes(request.getShopTypes());
        shop.setOpenTime(request.getOpenTime());
        shop.setCloseTime(request.getCloseTime());
        shop.setServicesOffered(request.getServicesOffered());
        shop.setRating(0.0);
        shop.setTotalRatings(0);
        shop.setIsAvailable(true);
        // Auto-verify as per new requirements
        
        
        return mechanicShopRepository.save(shop);
    }
    
    public MechanicShop updateShop(String userId, CreateShopRequest request) {
        MechanicShop shop = mechanicShopRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        
        shop.setShopName(request.getShopName());
        shop.setPhone(request.getPhone());
        if (request.getLocation() != null) {
            shop.setLocation(new GeoJsonPoint(
                request.getLocation().getLongitude(),
                request.getLocation().getLatitude()
            ));
        }
        shop.setAddress(request.getAddress());
        shop.setShopTypes(request.getShopTypes());
        shop.setOpenTime(request.getOpenTime());
        shop.setCloseTime(request.getCloseTime());
        shop.setServicesOffered(request.getServicesOffered());
        
        if (request.getIsAvailable() != null) {
            shop.setIsAvailable(request.getIsAvailable());
        }
        
        return mechanicShopRepository.save(shop);
    }
    
    public void toggleAvailability(String userId, Boolean isAvailable) {
        MechanicShop shop = mechanicShopRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        
        shop.setIsAvailable(isAvailable);
        mechanicShopRepository.save(shop);
        
        log.info("Shop {} availability toggled to: {}", shop.getShopName(), isAvailable);
    }
    
    public List<RepairRequest> getIncomingRequests(String userId) {
        MechanicShop shop = mechanicShopRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        
        return repairRequestRepository.findByMechanicShopIdAndStatus(shop.getId(), "PENDING");
    }
    
    public List<RepairRequest> getActiveJobs(String userId) {
        return repairRequestRepository.findByMechanicUserIdAndStatus(userId, "ACCEPTED");
    }
    
    public List<RepairRequest> getCompletedJobs(String userId) {
        return repairRequestRepository.findByMechanicUserIdAndStatus(userId, "COMPLETED");
    }

    public List<RepairRequest> getWorkHistory(String userId) {
        // Fetch specific history using the custom query
        List<RepairRequest> history = repairRequestRepository.findByMechanicHistory(userId);
        
        log.info("Found {} work history items for mechanic {}", history.size(), userId);
        
        // Log client location data for debugging
        for (RepairRequest req : history) {
            if (req.getClientLocation() != null) {
                log.debug("Request {} has client location: {} (Type: {})", 
                    req.getId(), 
                    req.getClientLocation().getCoordinates(), 
                    req.getClientLocation().getType());
            } else {
                log.warn("Request {} is MISSING client location! Status: {}, ClientId: {}", 
                    req.getId(), req.getStatus(), req.getClientId());
            }
        }
        
        return history;
    }

    public List<RepairRequest> getActiveLocations(String userId) {
        // Get ONLY accepted requests for this mechanic (not completed)
        // The client location should be visible as long as the request is ACCEPTED
        List<RepairRequest> acceptedRequests = repairRequestRepository.findByMechanicUserIdAndStatus(userId, "ACCEPTED");
        
        log.info("Found {} accepted requests for mechanic {}", acceptedRequests.size(), userId);
        
        // Log client location data for debugging
        for (RepairRequest req : acceptedRequests) {
            if (req.getClientLocation() != null) {
                log.debug("Active request {} has client location: {}", 
                    req.getId(), req.getClientLocation().getCoordinates());
            } else {
                log.warn("Active request {} is MISSING client location!", req.getId());
            }
        }
        
        // Return all accepted requests - they should show client location
        // until job is marked as COMPLETED
        return acceptedRequests;
    }
    
    @Transactional
    public RepairRequest acceptRequest(String userId, String requestId) {
        Objects.requireNonNull(requestId, "requestId must not be null");
        // Find the request
        RepairRequest request = repairRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        
        // Verify the request is for this mechanic's shop
        MechanicShop shop = mechanicShopRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        
        if (!request.getMechanicShopId().equals(shop.getId())) {
            throw new RuntimeException("Request is not for your shop");
        }
        
        if (!"PENDING".equals(request.getStatus()) && !"SOS_PENDING".equals(request.getStatus())) {
            throw new RuntimeException("Request is not in pending status");
        }
        
        // Update request status
        request.setStatus("ACCEPTED");
        request.setMechanicUserId(userId);
        request.setAcceptedAt(LocalDateTime.now());
        // Client location will remain visible until job is manually marked as COMPLETED
        repairRequestRepository.save(request);
        
        // Notify client
        notificationService.createNotification(
            request.getClientId(),
            "REQUEST_ACCEPTED",
            "Request Accepted",
            String.format("Your %s repair request has been accepted!", request.getVehicleType()),
            requestId
        );
        
        // CRITICAL: Handle Broadcast / Multiple Request Cleanup
        List<RepairRequest> otherRequests;
        
        if (request.getBroadcastId() != null && !request.getBroadcastId().isEmpty()) {
            // Using refined broadcast logic
            otherRequests = repairRequestRepository.findByBroadcastId(request.getBroadcastId());
        } else {
            // Fallback to client ID checks
            otherRequests = repairRequestRepository.findByClientIdAndStatus(request.getClientId(), "PENDING");
        }
        
        for (RepairRequest other : otherRequests) {
            // Check if it's "other" (different ID) OR if it's the same ID but we want to be safe (id should be unique though)
            // Ideally we only delete strictly 'other' requests.
            // Note: If using findByBroadcastId, the current 'request' will also be in the list.
            if (!other.getId().equals(requestId)) {
                // If it's a broadcast request (same broadcastId) OR just a lingering request from same client
                // We should auto-cancel it to avoid duplicate acceptance.
                
                // Notify the mechanic who *missed* this job
                // We need to send a socket message to remove it from their dashboard
                if (other.getMechanicShopId() != null) {
                     mechanicShopRepository.findById(java.util.Objects.requireNonNull(other.getMechanicShopId())).ifPresent(otherShop -> {
                         String otherMechanicId = otherShop.getUserId();
                         log.info("Notifying mechanic {} about request taken: {}", otherMechanicId, other.getId());
                         notificationService.createNotification(
                            otherMechanicId,
                            "REQUEST_TAKEN",
                            "Request Taken",
                            "A request you received has been accepted by another mechanic.",
                            other.getId()
                         );
                         // JSON payload for socket
                         webSocketService.sendToUser(otherMechanicId, "REQUEST_TAKEN", other);
                     });
                } else {
                    log.warn("Other request {} has no shop ID, skipping notification", other.getId());
                }
                
                // Delete the request
                repairRequestRepository.delete(other);
            }
        }
        
        log.info("Request {} accepted by mechanic {}. Cleaned up {} other pending requests.", 
                requestId, userId, otherRequests.size() - 1);
        
        // Send WebSocket notification to client
        webSocketService.sendToUser(request.getClientId(), "REQUEST_ACCEPTED", request);
        
        return request;
    }
    
    @Transactional
    public RepairRequest rejectRequest(String userId, String requestId) {
        Objects.requireNonNull(requestId, "requestId must not be null");
        RepairRequest request = repairRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        
        // Check permissions (optional but good practice)
        // Mechanics can reject requests assigned to their shop
        
        // Update status to REJECTED
        request.setStatus("REJECTED");
        
        // Add to rejectedBy (legacy logic, kept for consistency)
        if (request.getRejectedBy() == null) {
            request.setRejectedBy(new java.util.ArrayList<>());
        }
        if (!request.getRejectedBy().contains(userId)) {
            request.getRejectedBy().add(userId);
        }
        
        // Create notification for client
        notificationService.createNotification(
            request.getClientId(),
            "REQUEST_REJECTED",
            "Request Rejected",
            String.format("Your %s repair request has been rejected by the mechanic.", request.getVehicleType()),
            requestId
        );
        
        return repairRequestRepository.save(request);
    }
    
    public void updateRequestStatus(String userId, String requestId, String status) {
        Objects.requireNonNull(requestId, "requestId must not be null");
        RepairRequest request = repairRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        
        if (!request.getMechanicUserId().equals(userId)) {
            throw new RuntimeException("You are not assigned to this request");
        }
        
        request.setStatus(status);
        
        if ("COMPLETED".equals(status)) {
            request.setCompletedAt(LocalDateTime.now());
        }
        
        repairRequestRepository.save(request);
        
        // Notify client
        webSocketService.sendToUser(request.getClientId(), "STATUS_UPDATE", request);
    }
}
