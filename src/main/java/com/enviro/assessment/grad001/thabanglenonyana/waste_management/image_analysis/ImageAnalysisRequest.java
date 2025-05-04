package com.enviro.assessment.grad001.thabanglenonyana.waste_management.image_analysis;

import lombok.Data;

@Data
public class ImageAnalysisRequest {
    private Double latitude;
    private Double longitude;
    private Double radius = 10.0; // Default radius in km
}
