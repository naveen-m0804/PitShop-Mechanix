package com.roadside.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.roadside.model.MechanicShop;

@Repository
public interface MechanicShopRepository extends MongoRepository<MechanicShop, String> {

    Optional<MechanicShop> findByUserId(String userId);

    // Geospatial query: Find shops near a location within max distance
    // Removed verificationStatus filter for testing purposes
    @Query("{ 'location': { $near: { $geometry: { type: 'Point', coordinates: [?1, ?0] }, $maxDistance: ?2 } }, 'isAvailable': true }")
    List<MechanicShop> findNearbyShops(double latitude, double longitude, double maxDistance);

    // Geospatial query: Find all shops near a location within max distance (include unavailable)
    @Query("{ 'location': { $near: { $geometry: { type: 'Point', coordinates: [?1, ?0] }, $maxDistance: ?2 } } }")
    List<MechanicShop> findNearbyShopsAll(double latitude, double longitude, double maxDistance);

    // Find all shops (for "Show All" feature)
    List<MechanicShop> findByIsAvailable(Boolean isAvailable);

    // Filter by shop type
    // Removed verificationStatus filter for testing purposes
    @Query("{ 'location': { $near: { $geometry: { type: 'Point', coordinates: [?1, ?0] }, $maxDistance: ?2 } }, 'shopTypes': ?3, 'isAvailable': true }")
    List<MechanicShop> findNearbyShopsByType(double latitude, double longitude, double maxDistance, String shopType);

    // Filter by shop type (include unavailable)
    @Query("{ 'location': { $near: { $geometry: { type: 'Point', coordinates: [?1, ?0] }, $maxDistance: ?2 } }, 'shopTypes': ?3 }")
    List<MechanicShop> findNearbyShopsByTypeAll(double latitude, double longitude, double maxDistance, String shopType);
}
