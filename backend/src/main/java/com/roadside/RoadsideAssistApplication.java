package com.roadside;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableMongoAuditing
@EnableScheduling
public class RoadsideAssistApplication {

	public static void main(String[] args) {
		SpringApplication.run(RoadsideAssistApplication.class, args);
	}

    @Bean
    public CommandLineRunner logEnvVariables() {
        return args -> {
            String mongoUri = System.getenv("MONGODB_URI");
            System.out.println("DEBUG: MONGODB_URI is " + (mongoUri != null ? "SET (starts with " + mongoUri.substring(0, Math.min(mongoUri.length(), 15)) + ")" : "NULL"));
        };
    }
}
