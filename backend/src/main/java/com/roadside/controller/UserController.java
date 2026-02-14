package com.roadside.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.roadside.dto.ApiResponse;
import com.roadside.dto.UserProfileResponse;
import com.roadside.model.MechanicShop;
import com.roadside.model.User;
import com.roadside.repository.MechanicShopRepository;
import com.roadside.repository.UserRepository;
import com.roadside.service.UserService;
import org.springframework.web.bind.annotation.DeleteMapping;

@RestController
@RequestMapping("/api/v1/user")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:3001", "http://localhost:5174"})
public class UserController {
    
    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final UserRepository userRepository;
    private final MechanicShopRepository mechanicShopRepository;
    private final UserService userService;

    public UserController(UserRepository userRepository, MechanicShopRepository mechanicShopRepository, UserService userService) {
        this.userRepository = userRepository;
        this.mechanicShopRepository = mechanicShopRepository;
        this.userService = userService;
    }
    
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUserProfile(Authentication authentication) {
        try {
            String userId = authentication.getName();
            log.info("Fetching profile for user: {}", userId);
            
            User user = userRepository.findById(java.util.Objects.requireNonNull(userId))
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // If mechanic, fetch shop details
            MechanicShop shop = null;
            if ("MECHANIC".equals(user.getRole())) {
                shop = mechanicShopRepository.findByUserId(userId).orElse(null);
            }
            
            UserProfileResponse profile = UserProfileResponse.fromUser(user, shop);
            return ResponseEntity.ok(ApiResponse.success(profile));
        } catch (Exception e) {
            log.error("Error fetching user profile", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch profile: " + e.getMessage()));
        }
    }
    
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @RequestBody com.roadside.dto.UpdateProfileRequest request,
            Authentication authentication) {
        try {
            String userId = authentication.getName();
            log.info("Updating profile for user: {}", userId);
            
            User user = userRepository.findById(java.util.Objects.requireNonNull(userId))
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Update user details
            user.setName(request.getName());
            user.setPhone(request.getPhone());
            
            userRepository.save(user);
            
            // Fetch shop details if mechanic
            MechanicShop shop = null;
            if ("MECHANIC".equals(user.getRole())) {
                shop = mechanicShopRepository.findByUserId(userId).orElse(null);
            }
            
            UserProfileResponse profile = UserProfileResponse.fromUser(user, shop);
            return ResponseEntity.ok(ApiResponse.success(profile));
        } catch (Exception e) {
            log.error("Error updating user profile", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to update profile: " + e.getMessage()));
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponse<String>> deleteAccount(Authentication authentication) {
        try {
            String userId = authentication.getName();
            log.info("Request to delete account for user: {}", userId);
            
            userService.deleteUser(userId);
            
            return ResponseEntity.ok(ApiResponse.success("Account deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting account", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to delete account: " + e.getMessage()));
        }
    }
}
