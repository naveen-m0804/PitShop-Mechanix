package com.roadside.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import jakarta.validation.constraints.NotNull;
public class CreateShopRequest {
    
    @NotBlank(message = "Shop name is required")
    private String shopName;
    
    @NotBlank(message = "Phone number is required")
    private String phone;
    
    @NotNull(message = "Location is required")
    @Valid
    private LocationDTO location;
    
    @NotBlank(message = "Address is required")
    private String address;
    
    @NotEmpty(message = "At least one shop type is required")
    private List<String> shopTypes;
    
    @NotBlank(message = "Open time is required")
    private String openTime;
    
    @NotBlank(message = "Close time is required")
    private String closeTime;
    
    private Boolean isAvailable;
    
    private String servicesOffered;

    public CreateShopRequest() {}

    public CreateShopRequest(String shopName, String phone, LocationDTO location, String address, List<String> shopTypes, String openTime, String closeTime, Boolean isAvailable, String servicesOffered) {
        this.shopName = shopName;
        this.phone = phone;
        this.location = location;
        this.address = address;
        this.shopTypes = shopTypes;
        this.openTime = openTime;
        this.closeTime = closeTime;
        this.isAvailable = isAvailable;
        this.servicesOffered = servicesOffered;
    }

    // Manual Getters and Setters
    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public LocationDTO getLocation() { return location; }
    public void setLocation(LocationDTO location) { this.location = location; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public List<String> getShopTypes() { return shopTypes; }
    public void setShopTypes(List<String> shopTypes) { this.shopTypes = shopTypes; }
    public String getOpenTime() { return openTime; }
    public void setOpenTime(String openTime) { this.openTime = openTime; }
    public String getCloseTime() { return closeTime; }
    public void setCloseTime(String closeTime) { this.closeTime = closeTime; }
    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
    public String getServicesOffered() { return servicesOffered; }
    public void setServicesOffered(String servicesOffered) { this.servicesOffered = servicesOffered; }
}
