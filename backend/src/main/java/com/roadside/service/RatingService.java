package com.roadside.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.roadside.model.MechanicShop;
import com.roadside.model.Rating;
import com.roadside.repository.MechanicShopRepository;
import com.roadside.repository.RatingRepository;

@Service
public class RatingService {

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private MechanicShopRepository mechanicShopRepository;
    
    public Rating submitRating(String userId, String mechanicShopId, Integer starRating, String requestId) {
        // Validate rating value
        if (starRating == null || starRating < 1 || starRating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        
        // Find existing rating by this user for the shop (regardless of request ID)
        Rating existing = ratingRepository.findByUserIdAndMechanicShopId(userId, mechanicShopId).orElse(null);
        Rating ratingToSave;
        
        if (existing != null) {
            // Update existing rating
            existing.setRating(starRating);
            existing.setCreatedAt(LocalDateTime.now());
            // Update request ID to the latest one if provided
            if (requestId != null) {
                existing.setRequestId(requestId);
            }
            ratingToSave = existing;
        } else {
            // Create New Rating
            Rating rating = new Rating();
            rating.setUserId(userId);
            rating.setMechanicShopId(mechanicShopId);
            rating.setRating(starRating);
            rating.setRequestId(requestId);
            rating.setCreatedAt(LocalDateTime.now());
            ratingToSave = rating;
        }
        
        Rating savedRating = ratingRepository.save(ratingToSave);
        
        // Update mechanic shop aggregate by RECALCULATING
        recalculateShopRating(mechanicShopId);
        
        return savedRating;
    }
    
    private void recalculateShopRating(String shopId) {
        if (shopId == null) return;
        MechanicShop shop = mechanicShopRepository.findById(shopId).orElse(null);
        if (shop != null) {
            List<Rating> ratings = ratingRepository.findByMechanicShopId(shopId);
            
            if (ratings.isEmpty()) {
                shop.setTotalRatings(0);
                shop.setRating(0.0);
            } else {
                double avg = ratings.stream().mapToInt(Rating::getRating).average().orElse(0.0);
                shop.setTotalRatings(ratings.size());
                shop.setRating(avg);
            }
            
            mechanicShopRepository.save(shop);
        }
    }
    
    public List<Rating> getRatingsByShop(String shopId) {
        return ratingRepository.findByMechanicShopId(shopId);
    }
}
