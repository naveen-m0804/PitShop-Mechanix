package com.roadside.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.roadside.model.Rating;

public interface RatingRepository extends MongoRepository<Rating, String> {
    
    List<Rating> findByMechanicShopId(String mechanicShopId);
    
    List<Rating> findByUserId(String userId);
    
    boolean existsByUserIdAndRequestId(String userId, String requestId);
    
    java.util.Optional<Rating> findByUserIdAndMechanicShopId(String userId, String mechanicShopId);
}
