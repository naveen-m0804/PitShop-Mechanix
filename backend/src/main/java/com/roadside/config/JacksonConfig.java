package com.roadside.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import java.io.IOException;

/**
 * Jackson configuration to ensure proper serialization of GeoJSON and other types
 */
@Configuration
public class JacksonConfig {
    
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = Jackson2ObjectMapperBuilder.json()
                .modules(new JavaTimeModule())
                .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .failOnUnknownProperties(false)
                .build();
                
        SimpleModule geoModule = new SimpleModule();
        geoModule.addDeserializer(GeoJsonPoint.class, new GeoJsonPointDeserializer());
        mapper.registerModule(geoModule);
        
        return mapper;
    }
    
    // Custom Deserializer for GeoJsonPoint
    public static class GeoJsonPointDeserializer extends JsonDeserializer<GeoJsonPoint> {
        @Override
        public GeoJsonPoint deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
            JsonNode node = p.getCodec().readTree(p);
            
            if (node.has("coordinates") && node.get("coordinates").isArray()) {
                JsonNode coordinates = node.get("coordinates");
                if (coordinates.size() >= 2) {
                    double x = coordinates.get(0).asDouble(); // Longitude
                    double y = coordinates.get(1).asDouble(); // Latitude
                    return new GeoJsonPoint(x, y);
                }
            }
            return null;
        }
    }
}
