package com.enviro.assessment.grad001.thabanglenonyana.waste_management.util;

import com.azure.ai.vision.imageanalysis.ImageAnalysisClient;
import com.azure.ai.vision.imageanalysis.ImageAnalysisClientBuilder;
import com.azure.core.credential.AzureKeyCredential;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
public class AzureConfig {
    private static final Logger logger = LoggerFactory.getLogger(AzureConfig.class);

    @Value("${azure.vision.key:${VISION_KEY:}}")
    private String visionKey;

    @Value("${azure.vision.endpoint:${VISION_ENDPOINT:}}")
    private String visionEndpoint;

    @Bean
    @Profile("prod")
    public ImageAnalysisClient imageAnalysisClient() {
        if (visionKey == null || visionKey.isEmpty()) {
            logger.error("Azure Vision API key is not configured. Set the VISION_KEY environment variable or azure.vision.key property.");
            throw new IllegalStateException("Azure Vision API key cannot be empty");
        }
        
        if (visionEndpoint == null || visionEndpoint.isEmpty()) {
            logger.error("Azure Vision API endpoint is not configured. Set the VISION_ENDPOINT environment variable or azure.vision.endpoint property.");
            throw new IllegalStateException("Azure Vision API endpoint cannot be empty");
        }
        
        logger.info("Initializing Azure Vision API client with endpoint: {}", visionEndpoint);
        return new ImageAnalysisClientBuilder()
                .endpoint(visionEndpoint)
                .credential(new AzureKeyCredential(visionKey))
                .buildClient();
    }
    
    @Bean
    @Profile("!prod")
    public ImageAnalysisClient devImageAnalysisClient() {
        // For non-production environments, you could implement a mock client
        // or return null if the service is not needed in development
        logger.info("Using development/mock Azure Vision client");
        return null; // Replace with mock implementation if needed for testing
    }
}
