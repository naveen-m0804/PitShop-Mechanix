package com.roadside.repository;

import com.roadside.model.RepairRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RepairRequestRepository extends MongoRepository<RepairRequest, String> {

    List<RepairRequest> findByClientId(String clientId);

    List<RepairRequest> findByClientIdAndStatus(String clientId, String status);

    List<RepairRequest> findByMechanicShopIdAndStatus(String mechanicShopId, String status);

    List<RepairRequest> findByMechanicUserIdAndStatus(String mechanicUserId, String status);

    // Critical: Auto-delete other pending requests when one is accepted
    void deleteByClientIdAndStatusAndIdNot(String clientId, String status, String excludeId);
    
    // Find requests by broadcast ID
    List<RepairRequest> findByBroadcastId(String broadcastId);

    // For auto-expire scheduler
    List<RepairRequest> findByStatusAndCreatedAtBefore(String status, LocalDateTime expiryTime);

    // Count requests for fraud detection
    Long countByClientIdAndCreatedAtAfter(String clientId, LocalDateTime since);

    Long countByClientIdAndStatus(String clientId, String status);

    @org.springframework.data.mongodb.repository.Query("{ '$or': [ { 'mechanicUserId': ?0 }, { 'rejectedBy': ?0 } ] }")
    List<RepairRequest> findByMechanicHistory(String userId);

    void deleteByClientId(String clientId);
    void deleteByMechanicUserId(String mechanicUserId);
}
