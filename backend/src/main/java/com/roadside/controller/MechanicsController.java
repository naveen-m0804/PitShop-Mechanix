package com.roadside.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.roadside.dto.ApiResponse;
import com.roadside.model.MechanicShop;
import com.roadside.repository.MechanicShopRepository;

@RestController
@RequestMapping("/api/v1/mechanics")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class MechanicsController {
    
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(MechanicsController.class);
    
    private final MechanicShopRepository mechanicShopRepository;
    
    public MechanicsController(MechanicShopRepository mechanicShopRepository) {
        this.mechanicShopRepository = mechanicShopRepository;
    }
    
    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<List<MechanicShop>>> getNearbyMechanics(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "20") double radiusKm,
            @RequestParam(required = false) String vehicleType,
            @RequestParam(defaultValue = "false") boolean includeUnavailable
    ) {
        try {
            log.info("Fetching nearby mechanics - Lat: {}, Lon: {}, Radius: {}km, VehicleType: {}", 
                latitude, longitude, radiusKm, vehicleType);
            
            // Convert km to meters for MongoDB geospatial query
            double radiusMeters = radiusKm * 1000;
            
            List<MechanicShop> shops;
            if (vehicleType != null && !vehicleType.isEmpty()) {
                shops = includeUnavailable
                    ? mechanicShopRepository.findNearbyShopsByTypeAll(latitude, longitude, radiusMeters, vehicleType)
                    : mechanicShopRepository.findNearbyShopsByType(latitude, longitude, radiusMeters, vehicleType);
            } else {
                shops = includeUnavailable
                    ? mechanicShopRepository.findNearbyShopsAll(latitude, longitude, radiusMeters)
                    : mechanicShopRepository.findNearbyShops(latitude, longitude, radiusMeters);
            }
            
            log.info("Found {} nearby mechanics", shops.size());
            return ResponseEntity.ok(ApiResponse.success(shops));
        } catch (Exception e) {
            log.error("Error fetching nearby mechanics", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch nearby mechanics: " + e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<MechanicShop>>> getAllMechanics() {
        try {
            List<MechanicShop> shops = mechanicShopRepository.findAll();
            log.info("Fetching all mechanics - Found {}", shops.size());
            return ResponseEntity.ok(ApiResponse.success(shops));
        } catch (Exception e) {
            log.error("Error fetching all mechanics", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch all mechanics: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id:^(?!all$).+}")
    public ResponseEntity<ApiResponse<MechanicShop>> getMechanicById(@PathVariable @NonNull String id) {
        try {
            log.info("Fetching mechanic shop by ID: {}", id);
            
            MechanicShop shop = mechanicShopRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Mechanic shop not found"));
            
            return ResponseEntity.ok(ApiResponse.success(shop));
        } catch (Exception e) {
            log.error("Error fetching mechanic shop", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch mechanic: " + e.getMessage()));
        }
    }
}
