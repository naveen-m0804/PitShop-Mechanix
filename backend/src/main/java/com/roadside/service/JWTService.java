package com.roadside.service;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JWTService {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private Long expiration;
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
    
    public String generateToken(String userId, String role) {
        return Jwts.builder()
                .claim("role", role)
                .subject(userId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }
    
    public Claims validateToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    
    public String extractUserId(String token) {
        return validateToken(token).getSubject();
    }
    
    public String extractRole(String token) {
        return (String) validateToken(token).get("role");
    }
    
    public boolean isTokenExpired(String token) {
        try {
            return validateToken(token).getExpiration().before(new Date());
        } catch (Exception e) {
            return true;
        }
    }
}
