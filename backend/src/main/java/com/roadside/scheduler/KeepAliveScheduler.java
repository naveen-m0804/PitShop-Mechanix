package com.roadside.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class KeepAliveScheduler {

    private static final Logger logger = LoggerFactory.getLogger(KeepAliveScheduler.class);

    // Inject the Render URL from application.properties or environment variable
    @Value("${app.render.url:}")
    private String renderUrl;

    // Run every 14 minutes (14 * 60 * 1000 = 840000 ms)
    @Scheduled(fixedRate = 840000)
    public void keepAlive() {
        if (renderUrl == null || renderUrl.isEmpty() || renderUrl.equals("https://your-app-name.onrender.com")) {
            logger.warn("Render URL is not configured. Skipping keep-alive ping.");
            return;
        }

        try {
            logger.info("Pinging {} to keep the service alive...", renderUrl);
            RestTemplate restTemplate = new RestTemplate();
            String response = restTemplate.getForObject(renderUrl, String.class);
            logger.info("Ping successful. Response: {}", response != null ? "OK" : "Empty");
        } catch (Exception e) {
            logger.error("Failed to ping application at {}: {}", renderUrl, e.getMessage());
        }
    }
}
