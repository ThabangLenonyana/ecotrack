package com.enviro.assessment.grad001.thabanglenonyana.waste_management.image_analysis;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecognizedMaterial {
    private String materialType;
    private List<String> detectedObjects;
    private double confidenceScore;
    private String recyclingInstructions;
    private boolean isRecyclable;
    private Long wasteCategoryId;
}