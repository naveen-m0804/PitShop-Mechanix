package com.roadside.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // Restored import
import org.springframework.stereotype.Service;

import com.roadside.dto.AuthResponse;
import com.roadside.dto.LoginRequest;
import com.roadside.dto.RegisterRequest;
import com.roadside.dto.UserDTO;
import com.roadside.model.User;
import com.roadside.repository.UserRepository;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.roadside.dto.FirebaseLoginRequest;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    
    private final UserRepository userRepository;
    private final JWTService jwtService;
    private final MechanicService mechanicService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository, JWTService jwtService, MechanicService mechanicService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.mechanicService = mechanicService;
    }
    
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new RuntimeException("Email already registered");
        }
        
        // Create new user
        User user = new User();
        user.setEmail(request.getEmail().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());

        user.setIsActive(true);
        
        user = userRepository.save(user);
        
        // If user is a mechanic, create shop
        if ("MECHANIC".equals(request.getRole())) {
            try {
                com.roadside.dto.CreateShopRequest shopRequest = new com.roadside.dto.CreateShopRequest();
                shopRequest.setShopName(request.getShopName());
                shopRequest.setAddress(request.getAddress());
                shopRequest.setShopTypes(request.getShopTypes());
                shopRequest.setPhone(request.getPhone());
                shopRequest.setPhone(request.getPhone());
                // Set times with fallbacks
                shopRequest.setOpenTime(request.getOpenTime() != null ? request.getOpenTime() : "09:00");
                shopRequest.setCloseTime(request.getCloseTime() != null ? request.getCloseTime() : "18:00");
                shopRequest.setServicesOffered(request.getServicesOffered());
                
                // Set location from request if available, otherwise default
                com.roadside.dto.LocationDTO loc = new com.roadside.dto.LocationDTO();
                if (request.getLatitude() != null && request.getLongitude() != null) {
                    loc.setLatitude(request.getLatitude());
                    loc.setLongitude(request.getLongitude());
                } else {
                    loc.setLatitude(0.0);
                    loc.setLongitude(0.0);
                }
                shopRequest.setLocation(loc);
                
                mechanicService.createShop(user.getId(), shopRequest);
            } catch (Exception e) {
                log.error("Failed to create shop for user: {}", user.getId(), e);
            }
        }
        
        // Generate JWT token
        String token = jwtService.generateToken(user.getId(), user.getRole());
        
        // Convert to DTO
        UserDTO userDTO = convertToDTO(user);
        
        return new AuthResponse(token, userDTO);
    }
    
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());
        
        // Find user by email
        User user = userRepository.findByEmailAndIsActive(request.getEmail().toLowerCase(), true)
                .orElseThrow(() -> {
                    log.warn("User not found or inactive for email: {}", request.getEmail());
                    return new RuntimeException("Invalid email or password");
                });
        
        log.info("User found - ID: {}, Email: {}, Role: {}, Created: {}", 
            user.getId(), user.getEmail(), user.getRole(), user.getCreatedAt());
        
        // Verify password
        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());
        log.info("Password match result: {}", passwordMatches);
        
        if (!passwordMatches) {
            log.warn("Password mismatch for user: {}", user.getEmail());
            throw new RuntimeException("Invalid email or password");
        }
        
        // Generate JWT token
        String token = jwtService.generateToken(user.getId(), user.getRole());
        
        // Convert to DTO
        UserDTO userDTO = convertToDTO(user);
        
        return new AuthResponse(token, userDTO);
    }

    public AuthResponse firebaseLogin(FirebaseLoginRequest request) {
        try {
            // Verify Firebase Token
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(request.getIdToken());
            String email = decodedToken.getEmail();
            
            if (email == null) {
                throw new RuntimeException("Firebase token does not contain email.");
            }

            // Find existing user
            User user = userRepository.findByEmail(email).orElse(null);
            
            if (user == null) {
                // User not found - Do NOT auto-register. Throw explicit error for frontend to handle.
                throw new RuntimeException("User not registered. Please sign up first.");
            }
            
            log.info("Logging in existing user via Firebase: {}", email);
            if (!user.getIsActive()) {
                throw new RuntimeException("User account is inactive");
            }

            // Generate Internal JWT
            String token = jwtService.generateToken(user.getId(), user.getRole());
            
            // Return response
            return new AuthResponse(token, convertToDTO(user));

        } catch (Exception e) {
            log.error("Firebase login failed", e);
            throw new RuntimeException(e.getMessage());
        }
    }
    
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setProfilePicture(user.getProfilePicture());
        return dto;
    }
}
