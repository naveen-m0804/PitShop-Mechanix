package com.roadside.controller;

import com.roadside.dto.ApiResponse;
import com.roadside.dto.AuthResponse;
import com.roadside.dto.LoginRequest;
import com.roadside.dto.RegisterRequest;
import com.roadside.dto.FirebaseLoginRequest;
import com.roadside.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(ApiResponse.success("User registered successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("Received login request for email: {}", request.getEmail());
        try {
            AuthResponse response = authService.login(request);
            log.info("Login successful for email: {}", request.getEmail());
            return ResponseEntity.ok(ApiResponse.success("Login successful", response));
        } catch (Exception e) {
            log.error("Login failed for email: {}", request.getEmail(), e);
            throw e; // Let global exception handler handle it, or return badRequest here?
            // The original code returned badRequest. Let's keep that but log first.
        }
    }
    
    @PostMapping("/firebase-login")
    public ResponseEntity<ApiResponse<AuthResponse>> firebaseLogin(@Valid @RequestBody FirebaseLoginRequest request) {
        try {
            AuthResponse response = authService.firebaseLogin(request);
            return ResponseEntity.ok(ApiResponse.success("Login successful", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
