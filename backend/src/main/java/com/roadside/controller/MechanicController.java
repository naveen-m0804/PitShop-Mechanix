package com.roadside.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.roadside.dto.ApiResponse;
import com.roadside.dto.CreateShopRequest;
import com.roadside.model.MechanicShop;
import com.roadside.model.RepairRequest;
import com.roadside.service.MechanicService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/mechanic")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class MechanicController {
    
    private final MechanicService mechanicService;

    public MechanicController(MechanicService mechanicService) {
        this.mechanicService = mechanicService;
    }
    
    @PostMapping("/create-shop")
    public ResponseEntity<ApiResponse<MechanicShop>> createShop(
            @Valid @RequestBody CreateShopRequest request,
            Authentication authentication
    ) {
        try {
            String userId = authentication.getName();
            MechanicShop shop = mechanicService.createShop(userId, request);
            return ResponseEntity.ok(ApiResponse.success("Shop created successfully", shop));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PutMapping("/update-shop")
    public ResponseEntity<ApiResponse<MechanicShop>> updateShop(
            @Valid @RequestBody CreateShopRequest request,
            Authentication authentication
    ) {
        try {
            String userId = authentication.getName();
            MechanicShop shop = mechanicService.updateShop(userId, request);
            return ResponseEntity.ok(ApiResponse.success("Shop updated successfully", shop));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/toggle-availability")
    public ResponseEntity<ApiResponse<String>> toggleAvailability(
            @RequestBody Map<String, Boolean> request,
            Authentication authentication
    ) {
        try {
            String userId = authentication.getName();
            Boolean isAvailable = request.get("available");
            mechanicService.toggleAvailability(userId, isAvailable);
            return ResponseEntity.ok(ApiResponse.success("Availability updated", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/incoming-requests")
    public ResponseEntity<ApiResponse<List<RepairRequest>>> getIncomingRequests(
            Authentication authentication
    ) {
        try {
            String userId = authentication.getName();
            List<RepairRequest> requests = mechanicService.getIncomingRequests(userId);
            return ResponseEntity.ok(ApiResponse.success(requests));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/active-jobs")
    public ResponseEntity<ApiResponse<List<RepairRequest>>> getActiveJobs(
            Authentication authentication
    ) {
        try {
            String userId = authentication.getName();
            List<RepairRequest> jobs = mechanicService.getActiveJobs(userId);
            return ResponseEntity.ok(ApiResponse.success(jobs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/active-locations")
    public ResponseEntity<ApiResponse<List<RepairRequest>>> getActiveLocations(
            Authentication authentication
    ) {
        try {
            String userId = authentication.getName();
            List<RepairRequest> locations = mechanicService.getActiveLocations(userId);
            return ResponseEntity.ok(ApiResponse.success(locations));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/completed-jobs")
    public ResponseEntity<ApiResponse<List<RepairRequest>>> getCompletedJobs(
            Authentication authentication
    ) {
        try {
            String userId = authentication.getName();
            List<RepairRequest> jobs = mechanicService.getCompletedJobs(userId);
            return ResponseEntity.ok(ApiResponse.success(jobs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/work-history")
    public ResponseEntity<ApiResponse<List<RepairRequest>>> getWorkHistory(
            Authentication authentication
    ) {
        try {
            String userId = authentication.getName();
            List<RepairRequest> history = mechanicService.getWorkHistory(userId);
            return ResponseEntity.ok(ApiResponse.success(history));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/accept-request/{requestId}")
    public ResponseEntity<ApiResponse<RepairRequest>> acceptRequest(
            @PathVariable String requestId,
            Authentication authentication
    ) {
        try {
            String userId = authentication.getName();
            RepairRequest request = mechanicService.acceptRequest(userId, requestId);
            return ResponseEntity.ok(ApiResponse.success("Request accepted successfully", request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/reject-request/{requestId}")
    public ResponseEntity<ApiResponse<RepairRequest>> rejectRequest(
            @PathVariable String requestId,
            Authentication authentication
    ) {
        try {
            String userId = authentication.getName();
            RepairRequest request = mechanicService.rejectRequest(userId, requestId);
            return ResponseEntity.ok(ApiResponse.success("Request rejected", request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/update-status/{requestId}")
    public ResponseEntity<ApiResponse<String>> updateRequestStatus(
            @PathVariable String requestId,
            @RequestBody Map<String, String> request,
            Authentication authentication
    ) {
        try {
            String userId = authentication.getName();
            String status = request.get("status");
            mechanicService.updateRequestStatus(userId, requestId, status);
            return ResponseEntity.ok(ApiResponse.success("Status updated successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
