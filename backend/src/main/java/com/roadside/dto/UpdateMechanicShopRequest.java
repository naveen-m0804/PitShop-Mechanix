package com.roadside.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateMechanicShopRequest {
    
    @NotBlank(message = "Shop name is required")
    private String shopName;
    
    @NotBlank(message = "Address is required")
    private String address;
    
    @NotBlank(message = "Opening time is required")
    private String openTime;
    
    @NotBlank(message = "Closing time is required")
    private String closeTime;
    
    private Boolean isAvailable;
    
    private String servicesOffered;

    public UpdateMechanicShopRequest() {}

    public UpdateMechanicShopRequest(String shopName, String address, String openTime, String closeTime, Boolean isAvailable, String servicesOffered) {
        this.shopName = shopName;
        this.address = address;
        this.openTime = openTime;
        this.closeTime = closeTime;
        this.isAvailable = isAvailable;
        this.servicesOffered = servicesOffered;
    }

    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getOpenTime() { return openTime; }
    public void setOpenTime(String openTime) { this.openTime = openTime; }

    public String getCloseTime() { return closeTime; }
    public void setCloseTime(String closeTime) { this.closeTime = closeTime; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }

    public String getServicesOffered() { return servicesOffered; }
    public void setServicesOffered(String servicesOffered) { this.servicesOffered = servicesOffered; }
}
