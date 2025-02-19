package com.enviro.assessment.grad001.thabanglenonyana.waste_management.category;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline.DisposalGuidelineDTO;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip.RecyclingTipDTO;

@Data
public class WasteCategoryDTO {
    private Long id;

    @NotBlank(message = "Category name is required")
    private String name;

    @NotBlank(message = "Category description is required")
    private String description;
    
    private List<DisposalGuidelineDTO> disposalGuidelines;
    private List<RecyclingTipDTO> recyclingTips;
}
