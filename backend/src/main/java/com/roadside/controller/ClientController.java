package com.roadside.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.roadside.dto.ApiResponse;
import com.roadside.dto.CreateRequestDTO;
import com.roadside.dto.LocationDTO;
import com.roadside.model.MechanicShop;
import com.roadside.model.RepairRequest;
import com.roadside.service.ClientService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/client")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ClientController {
    
    private final ClientService clientService;
    
    @GetMapping("/nearby-shops")
    public ResponseEntity<ApiResponse<List<MechanicShop>>> getNearbyShops(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(required = false) Double radius,
            @RequestParam(required = false) String shopType
    ) {
        try {
            LocationDTO location = new LocationDTO(lat, lng);
            List<MechanicShop> shops = clientService.getNearbyShops(location, radius, shopType);
            return ResponseEntity.ok(ApiResponse.success(shops));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/all-shops")
    public ResponseEntity<ApiResponse<List<MechanicShop>>> getAllShops() {
        try {
            List<MechanicShop> shops = clientService.getAllShops();
            return ResponseEntity.ok(ApiResponse.success(shops));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/create-request")
    public ResponseEntity<ApiResponse<RepairRequest>> createRequest(
            @Valid @RequestBody CreateRequestDTO request,
            Authentication authentication
    ) {
        try {
            String clientId = authentication.getName();
            RepairRequest repairRequest = clientService.createRequest(clientId, request);
            return ResponseEntity.ok(ApiResponse.success("Request created successfully", repairRequest));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/sos")
    public ResponseEntity<ApiResponse<RepairRequest>> createSOSRequest(
            @Valid @RequestBody Map<String, Object> request,
            Authentication authentication
    ) {
        try {
            String clientId = authentication.getName();
            
            @SuppressWarnings("unchecked")
            Map<String, Double> locationMap = (Map<String, Double>) request.get("location");
            LocationDTO location = new LocationDTO(
                locationMap.get("latitude"),
                locationMap.get("longitude")
            );
            String address = (String) request.get("address");
            
            RepairRequest sosRequest = clientService.createSOSRequest(clientId, location, address);
            return ResponseEntity.ok(ApiResponse.success("SOS request created", sosRequest));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/my-requests")
    public ResponseEntity<ApiResponse<List<RepairRequest>>> getMyRequests(
            @RequestParam(required = false) String status,
            Authentication authentication
    ) {
        try {
            String clientId = authentication.getName();
            List<RepairRequest> requests = clientService.getMyRequests(clientId, status);
            return ResponseEntity.ok(ApiResponse.success(requests));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/rate-request/{requestId}")
    public ResponseEntity<ApiResponse<String>> rateRequest(
            @PathVariable String requestId,
            @RequestBody Map<String, Object> ratingData,
            Authentication authentication
    ) {
        try {
            String clientId = authentication.getName();
            Integer rating = (Integer) ratingData.get("rating");
            String review = (String) ratingData.get("review");
            
            clientService.rateRequest(clientId, requestId, rating, review);
            return ResponseEntity.ok(ApiResponse.success("Rating submitted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
