package com.roadside.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
public class BackendTestController {

    @GetMapping({"/", "/health"})
    public ResponseEntity<Map<String, Object>> checkHealth() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "message", "Roadside Assistance Backend is Running",
            "timestamp", LocalDateTime.now()
        ));
    }
}
