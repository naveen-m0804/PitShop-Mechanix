package com.roadside.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.roadside.model.Rating;
import com.roadside.service.RatingService;

@RestController
@RequestMapping("/api/v1/ratings")
public class RatingController {

    @Autowired
    private RatingService ratingService;
    
    @PostMapping
    public ResponseEntity<?> submitRating(@RequestBody Map<String, Object> payload) {
        try {
            String userId = (String) payload.get("userId");
            String mechanicShopId = (String) payload.get("mechanicShopId");
            Integer rating = (Integer) payload.get("rating");
            String requestId = (String) payload.get("requestId");
            
            Rating savedRating = ratingService.submitRating(userId, mechanicShopId, rating, requestId);
            return ResponseEntity.ok(savedRating);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error submitting rating"));
        }
    }
    
    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<Rating>> getShopRatings(@PathVariable String shopId) {
        return ResponseEntity.ok(ratingService.getRatingsByShop(shopId));
    }
}
