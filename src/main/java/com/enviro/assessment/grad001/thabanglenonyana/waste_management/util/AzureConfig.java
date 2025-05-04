package com.enviro.assessment.grad001.thabanglenonyana.waste_management.util;

import com.azure.ai.vision.imageanalysis.ImageAnalysisClient;
import com.azure.ai.vision.imageanalysis.ImageAnalysisClientBuilder;
import com.azure.core.credential.AzureKeyCredential;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AzureConfig {

    @Value("${azure.vision.key}")
    private String visionKey;

    @Value("${azure.vision.endpoint}")
    private String visionEndpoint;

    @Bean
    public ImageAnalysisClient imageAnalysisClient() {
        return new ImageAnalysisClientBuilder()
                .endpoint(visionEndpoint)
                .credential(new AzureKeyCredential(visionKey))
                .buildClient();
    }
}
