package com.roadside.dto;

public class UserDTO {
    
    private String id;
    private String phone;
    private String name;
    private String role;
    private String email;
    private String profilePicture;


    public UserDTO() {
    }

    public UserDTO(String id, String phone, String name, String role, String email, String profilePicture) {
        this.id = id;
        this.phone = phone;
        this.name = name;
        this.role = role;
        this.email = email;
        this.profilePicture = profilePicture;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }
}
