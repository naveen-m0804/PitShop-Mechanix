package com.roadside.config;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.lang.NonNull;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;

import jakarta.annotation.PostConstruct;

@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {
    
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(MongoConfig.class);
    
    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;
    
    @Override
    @NonNull
    protected String getDatabaseName() {
        return "repair_platform";
    }

    @Override
    protected void configureClientSettings(MongoClientSettings.Builder builder) {
        builder.applyConnectionString(new ConnectionString(mongoUri));
    }
    
    @PostConstruct
    public void createIndexes() {
        try (MongoClient mongoClient = MongoClients.create(mongoUri)) {
            MongoDatabase database = mongoClient.getDatabase(getDatabaseName());
            
            // Create geospatial index for mechanic_shops
            database.getCollection("mechanic_shops")
                    .createIndex(new Document("location", "2dsphere"));
            
            // Create geospatial index for repairRequest clientLocation
            database.getCollection("repairRequest")
                    .createIndex(new Document("clientLocation", "2dsphere"));
            
            log.info("MongoDB geospatial indexes created successfully");
        } catch (Exception e) {
            log.error("Failed to create MongoDB indexes: {}", e.getMessage());
        }
    }
}
