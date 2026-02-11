package com.roadside.controller;

import com.roadside.dto.DiagnosisRequestDTO;
import com.roadside.dto.DiagnosisResponseDTO;
import com.roadside.service.AIService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@CrossOrigin(origins = "*") // Allow frontend access
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/diagnose")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DiagnosisResponseDTO> diagnose(@RequestBody DiagnosisRequestDTO request) {
        return ResponseEntity.ok(aiService.diagnoseIssue(request));
    }
}
