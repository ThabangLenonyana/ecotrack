package com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.category.WasteCategoryDTO;  // assuming it exists

@Data
public class DisposalGuidelineDTO {
    private Long id;
    private Long categoryId;
    
    // New field to send complete category info to the front-end
    private WasteCategoryDTO category;

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;

    @NotBlank(message = "Instructions are required")
    private String instructions;
}
