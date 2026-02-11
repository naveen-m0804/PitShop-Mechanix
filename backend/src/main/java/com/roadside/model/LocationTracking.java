package com.roadside.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "location_tracking")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationTracking {
    
    @Id
    private String id;
    
    @Indexed
    private String requestId;
    
    private String mechanicUserId;
    
    private GeoJsonPoint location;
    
    @Indexed(expireAfterSeconds = 86400) // TTL index: auto-delete after 24 hours
    private LocalDateTime timestamp;
    
    private Double speed; // km/h
    
    private Double heading; // Degrees (0-360)
}
