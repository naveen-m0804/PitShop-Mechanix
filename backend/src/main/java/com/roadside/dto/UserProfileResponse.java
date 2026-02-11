package com.roadside.dto;

import com.roadside.model.MechanicShop;
import com.roadside.model.User;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String id;
    private String email;
    private String name;
    private String phone;
    private String role;
    private String profilePicture;
    private MechanicShop mechanicShop; // null if not a mechanic or no shop created
    
    public static UserProfileResponse fromUser(User user, MechanicShop shop) {
        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole());
        response.setProfilePicture(user.getProfilePicture());
        response.setMechanicShop(shop);
        return response;
    }
}
