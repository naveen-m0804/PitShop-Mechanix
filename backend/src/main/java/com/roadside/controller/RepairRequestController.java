package com.roadside.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.roadside.dto.ApiResponse;
import com.roadside.model.RepairRequest;
import com.roadside.repository.RepairRequestRepository;
import com.roadside.service.RepairRequestService;



@RestController
@RequestMapping("/api/v1/requests")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class RepairRequestController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(RepairRequestController.class);
    
    private final RepairRequestRepository repairRequestRepository;
    private final RepairRequestService repairRequestService;
    private final com.roadside.repository.MechanicShopRepository mechanicShopRepository;

    // Manual constructor
    public RepairRequestController(RepairRequestRepository repairRequestRepository, 
                                   RepairRequestService repairRequestService,
                                   com.roadside.repository.MechanicShopRepository mechanicShopRepository) {
        this.repairRequestRepository = repairRequestRepository;
        this.repairRequestService = repairRequestService;
        this.mechanicShopRepository = mechanicShopRepository;
    }

    @org.springframework.web.bind.annotation.PostMapping
    public ResponseEntity<ApiResponse<RepairRequest>> createRequest(
            @org.springframework.web.bind.annotation.RequestBody @jakarta.validation.Valid com.roadside.dto.CreateRequestDTO requestDTO,
            Authentication authentication) {
        try {
            String userId = authentication.getName();
            
            // Map DTO to Entity
            RepairRequest request = new RepairRequest();
            request.setClientId(userId); // Set from auth
            request.setMechanicShopId(requestDTO.getMechanicShopId());
            request.setClientAddress(requestDTO.getClientAddress());
            request.setVehicleType(requestDTO.getVehicleType());
            request.setProblemDescription(requestDTO.getProblemDescription());
            request.setAiSuggestion(requestDTO.getAiSuggestion());
            request.setImages(requestDTO.getImages());
            
            // Handle Type (Default to "NORMAL" if not present in DTO, or add to DTO)
            // Assuming "NORMAL" for now if DTO doesn't have it, but CreateRequest.tsx sends it.
            // CreateRequestDTO didn't seem to have 'type' field?
            // Let's add it or default it. Frontend sends 'type'.
            // I'll check if I need to add 'type' to DTO. 
            // For now, I'll default to "NORMAL" but if frontend sends SOS, it might be lost.
            // I SHOULD ADD 'type' to DTO. But for this replacement, I'll assume NORMAL or update DTO later.
            // Wait, CreateRequest.tsx definitely sends 'type'. 
            // I will default to "NORMAL" here, but strict correctness requires updating DTO validation. 
            // The file view of DTO didn't show 'type'.
            // Handle Type
            request.setType(requestDTO.getType() != null ? requestDTO.getType() : "NORMAL"); 
            
            // Map broadcastId
            request.setBroadcastId(requestDTO.getBroadcastId()); 

            // Create GeoJsonPoint manually to ensure correctness
            if (requestDTO.getClientLocation() != null) {
                request.setClientLocation(new org.springframework.data.mongodb.core.geo.GeoJsonPoint(
                    requestDTO.getClientLocation().getLongitude(),
                    requestDTO.getClientLocation().getLatitude()
                ));
            }
            
            log.info("Received repair request from user {}: {}", userId, request);
            
            RepairRequest createdRequest = repairRequestService.createRequest(request);
            return ResponseEntity.ok(ApiResponse.success(createdRequest));
        } catch (Exception e) {
            log.error("Error creating repair request", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to create request: " + e.getMessage()));
        }
    }

    @GetMapping("/my-requests")
    public ResponseEntity<ApiResponse<List<RepairRequest>>> getMyRequests(Authentication authentication) {
        try {
            String userId = authentication.getName();
            log.info("Fetching requests for user: {}", userId);
            
            // Get all requests for this client
            List<RepairRequest> requests = repairRequestRepository.findByClientId(userId);
            
            // Backfill Shop Details if missing (for frontend)
            for (RepairRequest req : requests) {
                if ((req.getShopName() == null || req.getShopPhone() == null) && req.getMechanicShopId() != null) {
                    mechanicShopRepository.findById(java.util.Objects.requireNonNull(req.getMechanicShopId())).ifPresent(shop -> {
                        req.setShopName(shop.getShopName());
                        req.setShopAddress(shop.getAddress());
                        req.setShopPhone(shop.getPhone());
                    });
                }
            }
            
            log.info("Found {} requests for user {}", requests.size(), userId);
            return ResponseEntity.ok(ApiResponse.success(requests));
        } catch (Exception e) {
            log.error("Error fetching user requests", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch requests: " + e.getMessage()));
        }
    }
}
