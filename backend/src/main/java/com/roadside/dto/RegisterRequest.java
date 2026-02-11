package com.roadside.dto;

import java.util.List;

public class RegisterRequest {
    private String name;
    private String email;
    private String phone;
    private String password;
    private String role;
    
    // For Mechanic
    private String shopName;
    private String address;
    private List<String> shopTypes;
    private String openTime;
    private String closeTime;
    
    // Location
    private Double latitude;
    private Double longitude;
    private String servicesOffered;

    public String getServicesOffered() {
        return servicesOffered;
    }

    public void setServicesOffered(String servicesOffered) {
        this.servicesOffered = servicesOffered;
    }

    public RegisterRequest() {
    }

    public RegisterRequest(String name, String email, String phone, String password, String role, String shopName, String address, List<String> shopTypes, String openTime, String closeTime, Double latitude, Double longitude) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.role = role;
        this.shopName = shopName;
        this.address = address;
        this.shopTypes = shopTypes;
        this.openTime = openTime;
        this.closeTime = closeTime;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    // Manual Getters and Setters to ensure availability
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public List<String> getShopTypes() { return shopTypes; }
    public void setShopTypes(List<String> shopTypes) { this.shopTypes = shopTypes; }
    public String getOpenTime() { return openTime; }
    public void setOpenTime(String openTime) { this.openTime = openTime; }
    public String getCloseTime() { return closeTime; }
    public void setCloseTime(String closeTime) { this.closeTime = closeTime; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}
