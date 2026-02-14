package com.roadside.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Base64;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.service-account-key:}")
    private String serviceAccountKey;

    @PostConstruct
    public void initialize() {
        try {
            if (serviceAccountKey == null || serviceAccountKey.isEmpty()) {
                System.out.println("Firebase Service Account key not found. Firebase Auth will not work.");
                return;
            }

            // Detect if key is base64 encoded by checking for JSON structure
            byte[] keyBytes;
            if (serviceAccountKey.trim().startsWith("{")) {
                keyBytes = serviceAccountKey.getBytes();
            } else {
                 try {
                    keyBytes = Base64.getDecoder().decode(serviceAccountKey);
                 } catch (IllegalArgumentException e) {
                    // Fallback to raw string if decoding fails
                    keyBytes = serviceAccountKey.getBytes();
                 }
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(new ByteArrayInputStream(keyBytes)))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("Firebase application has been initialized");
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
