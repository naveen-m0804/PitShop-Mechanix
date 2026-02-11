package com.roadside.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "mechanic_shops")
public class MechanicShop {
    
    @Id
    private String id;
    
    @Indexed
    private String userId; // Reference to User
    
    private String shopName;
    
    private String phone;
    
    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint location; // GeoJSON Point for geospatial queries
    
    private String address;
    
    private List<String> shopTypes; // CAR_REPAIR, BIKE_REPAIR, PUNCTURE
    
    private String openTime; // Format: "09:00"
    
    private String closeTime; // Format: "21:00"
    
    private Double rating = 0.0;
    
    private Integer totalRatings = 0;
    
    private Boolean isAvailable = true;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    @Transient
    private Double distance;
    
    private String servicesOffered;

    public MechanicShop() {}

    public MechanicShop(String id, String userId, String shopName, String phone, GeoJsonPoint location, String address, List<String> shopTypes, String openTime, String closeTime, Double rating, Integer totalRatings, Boolean isAvailable, LocalDateTime createdAt, LocalDateTime updatedAt, Double distance, String servicesOffered) {
        this.id = id;
        this.userId = userId;
        this.shopName = shopName;
        this.phone = phone;
        this.location = location;
        this.address = address;
        this.shopTypes = shopTypes;
        this.openTime = openTime;
        this.closeTime = closeTime;
        this.rating = rating;
        this.totalRatings = totalRatings;
        this.isAvailable = isAvailable;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.distance = distance;
        this.servicesOffered = servicesOffered;
    }

    // Manual Getter and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public GeoJsonPoint getLocation() { return location; }
    public void setLocation(GeoJsonPoint location) { this.location = location; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public List<String> getShopTypes() { return shopTypes; }
    public void setShopTypes(List<String> shopTypes) { this.shopTypes = shopTypes; }
    public String getOpenTime() { return openTime; }
    public void setOpenTime(String openTime) { this.openTime = openTime; }
    public String getCloseTime() { return closeTime; }
    public void setCloseTime(String closeTime) { this.closeTime = closeTime; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getTotalRatings() { return totalRatings; }
    public void setTotalRatings(Integer totalRatings) { this.totalRatings = totalRatings; }
    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }
    public String getServicesOffered() { return servicesOffered; }
    public void setServicesOffered(String servicesOffered) { this.servicesOffered = servicesOffered; }
}
