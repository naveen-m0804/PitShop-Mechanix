package com.roadside.service;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.stereotype.Service;

import com.roadside.dto.CreateRequestDTO;
import com.roadside.dto.LocationDTO;
import com.roadside.model.MechanicShop;
import com.roadside.model.RepairRequest;
import com.roadside.repository.MechanicShopRepository;
import com.roadside.repository.RepairRequestRepository;

@Service
public class ClientService {
    
    private static final Logger log = LoggerFactory.getLogger(ClientService.class);

    private final MechanicShopRepository mechanicShopRepository;
    private final RepairRequestRepository repairRequestRepository;
    private final WebSocketService webSocketService;

    public ClientService(MechanicShopRepository mechanicShopRepository, RepairRequestRepository repairRequestRepository, WebSocketService webSocketService) {
        this.mechanicShopRepository = mechanicShopRepository;
        this.repairRequestRepository = repairRequestRepository;
        this.webSocketService = webSocketService;
    }
    
    @Value("${geospatial.default-radius}")
    private Double defaultRadius;
    
    public List<MechanicShop> getNearbyShops(LocationDTO location, Double radius, String shopType) {
        double searchRadius = (radius != null) ? radius : defaultRadius;
        
        List<MechanicShop> shops;
        
        if (shopType != null && !shopType.isEmpty()) {
            shops = mechanicShopRepository.findNearbyShopsByTypeAll(
                location.getLatitude(),
                location.getLongitude(),
                searchRadius,
                shopType
            );
        } else {
            shops = mechanicShopRepository.findNearbyShopsAll(
                location.getLatitude(),
                location.getLongitude(),
                searchRadius
            );
        }
        
        // Calculate distance and check if shop is currently open
        return shops.stream()
            .filter(shop -> shop.getLocation() != null)
            .map(shop -> {
            double distance = calculateDistance(
                location.getLatitude(),
                location.getLongitude(),
                shop.getLocation().getY(),
                shop.getLocation().getX()
            );
            shop.setDistance(distance);
            return shop;
        }).sorted((a, b) -> Double.compare(a.getDistance(), b.getDistance()))
          .collect(Collectors.toList());
    }
    
    public List<MechanicShop> getAllShops() {
        return mechanicShopRepository.findAll();
    }
    
    public RepairRequest createRequest(String clientId, CreateRequestDTO request) {
        RepairRequest repairRequest = new RepairRequest();
        repairRequest.setClientId(clientId);
        repairRequest.setMechanicShopId(request.getMechanicShopId());
        if (request.getClientLocation() != null) {
            repairRequest.setClientLocation(new GeoJsonPoint(
                request.getClientLocation().getLongitude(),
                request.getClientLocation().getLatitude()
            ));
        }
        repairRequest.setClientAddress(request.getClientAddress());
        repairRequest.setVehicleType(request.getVehicleType());
        repairRequest.setProblemDescription(request.getProblemDescription());
        repairRequest.setAiSuggestion(request.getAiSuggestion());
        repairRequest.setImages(request.getImages());
        repairRequest.setStatus("PENDING");
        repairRequest.setType("NORMAL");
        
        RepairRequest saved = repairRequestRepository.save(repairRequest);
        
        log.info("Repair request created: {} for client: {}", saved.getId(), clientId);
        
        // Notify mechanic via WebSocket
        String shopId = request.getMechanicShopId();
        if (shopId != null) {
            MechanicShop shop = mechanicShopRepository.findById(shopId)
                    .orElse(null);
            if (shop != null) {
                saved.setShopName(shop.getShopName());
                saved.setShopAddress(shop.getAddress());
                saved = repairRequestRepository.save(saved); 

                webSocketService.sendToUser(shop.getUserId(), "NEW_REQUEST", saved);
            }
        }
        
        return saved;
    }
    
    public RepairRequest createSOSRequest(String clientId, LocationDTO location, String address) {
        RepairRequest sosRequest = new RepairRequest();
        sosRequest.setClientId(clientId);
        sosRequest.setClientLocation(new GeoJsonPoint(
            location.getLongitude(),
            location.getLatitude()
        ));
        sosRequest.setClientAddress(address);
        sosRequest.setStatus("SOS_PENDING");
        sosRequest.setType("SOS");
        sosRequest.setVehicleType("UNKNOWN");
        sosRequest.setProblemDescription("SOS Emergency Request");
        
        RepairRequest saved = repairRequestRepository.save(sosRequest);
        
        log.warn("SOS request created: {} at location: {}", saved.getId(), address);
        
        // Broadcast to all nearby mechanics (extended radius for SOS)
        List<MechanicShop> nearbyShops = mechanicShopRepository.findNearbyShops(
            location.getLatitude(),
            location.getLongitude(),
            20000.0 // 20km for SOS
        );
        
        for (MechanicShop shop : nearbyShops) {
            webSocketService.sendToUser(shop.getUserId(), "SOS_ALERT", saved);
        }
        
        return saved;
    }
    
    public List<RepairRequest> getMyRequests(String clientId, String status) {
        if (status != null && !status.isEmpty()) {
            return repairRequestRepository.findByClientIdAndStatus(clientId, status);
        }
        return repairRequestRepository.findByClientId(clientId);
    }
    
    public void rateRequest(String clientId, String requestId, Integer rating, String review) {
        Objects.requireNonNull(requestId, "requestId must not be null");
        RepairRequest request = repairRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        
        if (!request.getClientId().equals(clientId)) {
            throw new RuntimeException("You are not authorized to rate this request");
        }
        
        if (!"COMPLETED".equals(request.getStatus())) {
            throw new RuntimeException("Can only rate completed requests");
        }
        
        request.setRating(rating);
        request.setReview(review);
        repairRequestRepository.save(request);
        
        // Update mechanic shop rating
        updateShopRating(request.getMechanicShopId(), rating);
    }
    
    private void updateShopRating(String shopId, Integer newRating) {
        if (shopId == null) return;
        MechanicShop shop = mechanicShopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        
        int totalRatings = shop.getTotalRatings();
        double currentRating = shop.getRating();
        
        double updatedRating = ((currentRating * totalRatings) + newRating) / (totalRatings + 1);
        
        shop.setRating(updatedRating);
        shop.setTotalRatings(totalRatings + 1);
        
        mechanicShopRepository.save(shop);
    }
    
    // Haversine formula for distance calculation
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000; // Earth radius in meters
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c; // Distance in meters
    }
    
    public boolean isShopOpen(String openTime, String closeTime) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
            LocalTime open = LocalTime.parse(openTime, formatter);
            LocalTime close = LocalTime.parse(closeTime, formatter);
            LocalTime now = LocalTime.now();
            
            return now.isAfter(open) && now.isBefore(close);
        } catch (Exception e) {
            return true; // Default to open if parsing fails
        }
    }
}
