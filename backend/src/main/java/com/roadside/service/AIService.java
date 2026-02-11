package com.roadside.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.roadside.dto.DiagnosisRequestDTO;
import com.roadside.dto.DiagnosisResponseDTO;

import jakarta.annotation.PostConstruct;

/**
 * AI Service using Hugging Face Inference Providers with OpenAI-compatible API.
 * Uses Groq as the primary provider for ultra-fast inference.
 * 
 * @see <a href="https://huggingface.co/docs/inference-providers/en/index">HuggingFace Inference Providers</a>
 */
@Service
public class AIService {

    private static final Logger logger = LoggerFactory.getLogger(AIService.class);

    // Hugging Face Inference Providers Router Base URL (OpenAI-compatible)
    private static final String HF_INFERENCE_BASE_URL = "https://router.huggingface.co/v1/chat/completions";

    @Value("${huggingface.api.token:}")
    private String hfToken;

    // Model with provider suffix for routing
    // Options: :groq (fastest), :together, :sambanova, :fireworks, :fastest, :cheapest
    @Value("${huggingface.api.model:meta-llama/Llama-3.3-70B-Instruct:groq}")
    private String model;
    
    @PostConstruct
    public void init() {
        if (hfToken == null || hfToken.isEmpty()) {
            logger.error("HF_TOKEN is NOT set! Please check your .env file or environment variables.");
            logger.error("Get your token from: https://huggingface.co/settings/tokens");
        } else {
            logger.info("HF_TOKEN is loaded successfully (length: {})", hfToken.length());
            logger.info("Using model: {} via Hugging Face Inference Providers", model);
        }
    }

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public AIService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public DiagnosisResponseDTO diagnoseIssue(DiagnosisRequestDTO request) {
        try {
            String userPrompt = buildPrompt(request);
            String systemPrompt = """
                You are an expert certified vehicle mechanic AI assistant for a roadside assistance platform in INDIA.
                You have 20+ years of experience diagnosing vehicle issues common in Indian roads and conditions.
                
                IMPORTANT GUIDELINES:
                1. Always provide the MOST LIKELY causes first, based on common automotive issues in India
                2. Consider Indian driving conditions: dusty roads, monsoon season, heavy traffic, speed breakers
                3. For startup noises, consider: starter motor, battery, alternator, serpentine belt, pulleys, timing chain/belt
                4. Be helpful and provide actionable information even with limited details
                5. Include safety warnings when relevant (especially for roadside situations)
                6. If the vehicle info is provided (year, make, model), consider known issues for that specific vehicle
                7. Reference local repair options: authorized service centers, local mechanics (garage), roadside help
                
                PRICING RULES (IMPORTANT):
                - Do NOT include prices by default
                - ONLY mention costs in ₹ if the user specifically asks about price, cost, or budget
                - If user asks about cost, provide realistic Indian prices
                
                INDIAN VEHICLE CONTEXT:
                - Popular brands: Maruti Suzuki, Tata, Mahindra, Hyundai, Honda, Toyota, Kia
                - Common issues: AC problems (summer heat), battery drain (traffic jams), suspension (bad roads)
                
                CONFIDENCE LEVELS:
                - HIGH (75-100%): Symptoms clearly match a specific issue based on vehicle type and description
                - MEDIUM (50-74%): Likely cause identified but needs verification
                - LOW (25-49%): Multiple possible causes, need more information
                
                FORMATTING RULES (VERY IMPORTANT):
                - Use plain text, avoid special formatting symbols
                - List items with numbers (1. 2. 3.) or dashes (-)
                - Do NOT use asterisks (*) or underscores (_) for formatting
                - Keep paragraphs short and clear
                - Put each step on a new line
                
                Format your response EXACTLY as follows:
                DIAGNOSIS: [Specific issue title - be descriptive]
                RECOMMENDED ACTION: [Step-by-step actionable advice with safety warnings]
                CONFIDENCE: [HIGH/MEDIUM/LOW]
                CLARIFYING QUESTIONS: [Only 2-3 most important questions, or "None" if confident]
                """;

            // Build OpenAI-compatible request body for HuggingFace Inference Providers
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            
            // Messages array (OpenAI format)
            List<Map<String, String>> messages = new ArrayList<>();
            
            // System message
            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", systemPrompt);
            messages.add(systemMessage);
            
            // User message
            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", userPrompt);
            messages.add(userMessage);
            
            requestBody.put("messages", messages);
            
            // Generation parameters
            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", 1024);
            requestBody.put("stream", false);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (hfToken != null && !hfToken.isEmpty()) {
                final String token = hfToken;
                headers.setBearerAuth(token);
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            logger.debug("Sending request to Hugging Face Inference Providers: {}", model);
            ResponseEntity<String> response = restTemplate.postForEntity(HF_INFERENCE_BASE_URL, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return parseOpenAIResponse(response.getBody());
            } else {
                return createErrorResponse("Failed to get response from AI service");
            }

        } catch (HttpClientErrorException e) {
            logger.error("Hugging Face API client error - Status: {}, Response: {}", e.getStatusCode(), e.getResponseBodyAsString());
            int statusCode = e.getStatusCode().value();
            return switch (statusCode) {
                case 429 -> {
                    logger.warn("Rate limit exceeded - API quota exhausted");
                    yield createErrorResponse("AI service rate limit exceeded. Please try again in a few moments.");
                }
                case 401 -> {
                    logger.error("Authentication failed - Invalid HF_TOKEN");
                    yield createErrorResponse("AI service authentication failed. Please check the API token configuration.");
                }
                case 403 -> createErrorResponse("AI service access denied. Please verify your Hugging Face account permissions.");
                case 400 -> {
                    logger.error("400 Bad Request - Check request format or model availability");
                    yield createErrorResponse("Invalid request to AI service. Please try again.");
                }
                case 422 -> {
                    logger.error("422 Unprocessable Entity - Model may not be available on the selected provider");
                    yield createErrorResponse("The AI model is currently unavailable. Please try again later.");
                }
                default -> createErrorResponse("Unable to communicate with the AI service. Please try again later.");
            };
        } catch (HttpServerErrorException e) {
            logger.error("Hugging Face API server error - Status: {}, Response: {}", e.getStatusCode(), e.getResponseBodyAsString());
            return createErrorResponse("The AI service is experiencing technical difficulties. Please try again later.");
        } catch (RuntimeException e) {
            logger.error("Unexpected error calling Hugging Face API: {}", e.getMessage(), e);
            return createErrorResponse("An unexpected error occurred while processing your request. Please try again.");
        }
    }

    private String buildPrompt(DiagnosisRequestDTO request) {
        StringBuilder sb = new StringBuilder();
        sb.append("Vehicle Issue Analysis Request:\n");
        if (request.getYear() != null) {
            sb.append("Year: ").append(request.getYear()).append("\n");
        }
        if (request.getMake() != null && !request.getMake().isEmpty()) {
            sb.append("Make: ").append(request.getMake()).append("\n");
        }
        if (request.getModel() != null && !request.getModel().isEmpty()) {
            sb.append("Model: ").append(request.getModel()).append("\n");
        }
        sb.append("Issue Description: ").append(request.getIssueDescription());
        return sb.toString();
    }

    /**
     * Parse OpenAI-compatible response format from Hugging Face Inference Providers.
     * Response format:
     * {
     *   "choices": [{
     *     "message": {
     *       "role": "assistant",
     *       "content": "..."
     *     }
     *   }]
     * }
     */
    private DiagnosisResponseDTO parseOpenAIResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode choices = root.path("choices");
            
            if (choices.isArray() && !choices.isEmpty()) {
                JsonNode firstChoice = choices.get(0);
                JsonNode message = firstChoice.path("message");
                String content = message.path("content").asText();
                
                if (content != null && !content.isEmpty()) {
                    return parseStructuredResponse(content);
                }
            }
            
            // Check for error in response
            JsonNode error = root.path("error");
            if (!error.isMissingNode()) {
                String errorMessage = error.path("message").asText("Unknown error");
                logger.error("API returned error: {}", errorMessage);
                return createErrorResponse("AI service error: " + errorMessage);
            }
            
            return createErrorResponse("Could not parse AI response");
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            logger.error("Error parsing JSON response: {}", e.getMessage());
            return createErrorResponse("Error parsing response: " + e.getMessage());
        }
    }

    private DiagnosisResponseDTO parseStructuredResponse(String content) {
        DiagnosisResponseDTO response = new DiagnosisResponseDTO();
        
        String diagnosis = extractSection(content, "DIAGNOSIS:");
        String recommendedAction = extractSection(content, "RECOMMENDED ACTION:");
        String confidence = extractSection(content, "CONFIDENCE:");
        String questions = extractSection(content, "CLARIFYING QUESTIONS:");

        response.setDiagnosis(diagnosis.isEmpty() ? content.substring(0, Math.min(200, content.length())) : diagnosis);
        response.setRecommendedAction(recommendedAction.isEmpty() ? "Please consult a professional mechanic for a detailed inspection." : recommendedAction);
        response.setConfidenceScore(parseConfidence(confidence));
        response.setClarifyingQuestions(parseQuestions(questions));

        return response;
    }

    private String extractSection(String content, String sectionHeader) {
        int startIndex = content.indexOf(sectionHeader);
        if (startIndex == -1) {
            return "";
        }
        startIndex += sectionHeader.length();
        
        String[] sections = {"DIAGNOSIS:", "RECOMMENDED ACTION:", "CONFIDENCE:", "CLARIFYING QUESTIONS:"};
        int endIndex = content.length();
        
        for (String section : sections) {
            if (!section.equals(sectionHeader)) {
                int idx = content.indexOf(section, startIndex);
                if (idx != -1 && idx < endIndex) {
                    endIndex = idx;
                }
            }
        }
        
        return content.substring(startIndex, endIndex).trim();
    }

    private Double parseConfidence(String confidence) {
        if (confidence == null || confidence.isEmpty()) {
            return 0.5;
        }
        String upper = confidence.toUpperCase().trim();
        if (upper.contains("HIGH")) {
            return 0.85;
        } else if (upper.contains("MEDIUM")) {
            return 0.6;
        } else if (upper.contains("LOW")) {
            return 0.3;
        }
        return 0.5;
    }

    private List<String> parseQuestions(String questions) {
        List<String> result = new ArrayList<>();
        if (questions == null || questions.isEmpty() || questions.equalsIgnoreCase("None")) {
            return result;
        }
        
        String[] lines = questions.split("[\n\\-•]");
        for (String line : lines) {
            String trimmed = line.trim();
            if (!trimmed.isEmpty() && !trimmed.equalsIgnoreCase("none")) {
                trimmed = trimmed.replaceFirst("^\\d+\\.\\s*", "");
                if (!trimmed.isEmpty()) {
                    result.add(trimmed);
                }
            }
        }
        return result;
    }

    private DiagnosisResponseDTO createErrorResponse(String message) {
        DiagnosisResponseDTO response = new DiagnosisResponseDTO();
        response.setDiagnosis("Service Unavailable");
        response.setRecommendedAction(message);
        response.setConfidenceScore(0.0);
        response.setClarifyingQuestions(new ArrayList<>());
        return response;
    }
}
