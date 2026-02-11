package com.roadside.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.roadside.model.RepairRequest;
import com.roadside.repository.RepairRequestRepository;

@Service
public class RequestSchedulerService {
    
    private static final Logger log = LoggerFactory.getLogger(RequestSchedulerService.class);

    private final RepairRequestRepository repairRequestRepository;
    private final WebSocketService webSocketService;

    public RequestSchedulerService(RepairRequestRepository repairRequestRepository, WebSocketService webSocketService) {
        this.repairRequestRepository = repairRequestRepository;
        this.webSocketService = webSocketService;
    }
    
    @Value("${request.auto-expire-minutes}")
    private Integer autoExpireMinutes;
    
    @Scheduled(fixedDelayString = "${request.scheduler-interval-ms}")
    public void expirePendingRequests() {
        LocalDateTime expiryTime = LocalDateTime.now().minusMinutes(autoExpireMinutes);
        
        List<RepairRequest> expiredRequests = repairRequestRepository
                .findByStatusAndCreatedAtBefore("PENDING", expiryTime);
        
        if (!expiredRequests.isEmpty()) {
            log.info("Found {} expired pending requests", expiredRequests.size());
            
            for (RepairRequest request : expiredRequests) {
                request.setStatus("EXPIRED");
                repairRequestRepository.save(request);
                
                // Notify client
                webSocketService.sendToUser(
                    request.getClientId(),
                    "REQUEST_EXPIRED",
                    request
                );
                
                log.info("Request {} expired and client {} notified", 
                    request.getId(), request.getClientId());
            }
        }
    }
}
