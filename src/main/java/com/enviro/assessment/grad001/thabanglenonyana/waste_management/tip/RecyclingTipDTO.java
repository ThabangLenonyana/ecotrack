package com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.category.WasteCategoryDTO;

@Data
public class RecyclingTipDTO {
    private Long id;
    private WasteCategoryDTO category;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotEmpty(message = "Steps are required")
    private List<String> steps;
    
    @NotNull(message = "Difficulty level is required")
    private DifficultyLevel difficulty;
    
    private String environmentalImpact;
    
    @NotBlank(message = "Time requirement is required")
    private String timeRequired;
    
    private String requiredMaterials;
    
    private Long categoryId;
    
    
}