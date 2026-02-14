package com.roadside.repository;

import com.roadside.model.LocationTracking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationTrackingRepository extends MongoRepository<LocationTracking, String> {

    List<LocationTracking> findByRequestIdOrderByTimestampDesc(String requestId);

    Optional<LocationTracking> findFirstByRequestIdOrderByTimestampDesc(String requestId);

    void deleteByRequestId(String requestId);
    
    void deleteByMechanicUserId(String mechanicUserId);
}
