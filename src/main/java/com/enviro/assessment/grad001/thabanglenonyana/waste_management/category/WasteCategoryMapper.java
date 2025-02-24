package com.enviro.assessment.grad001.thabanglenonyana.waste_management.category;

import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline.DisposalGuideline;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline.DisposalGuidelineDTO;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip.RecyclingTip;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip.RecyclingTipDTO;

@Component
public class WasteCategoryMapper {
    
    public WasteCategoryDTO toDTO(WasteCategory category) {
        if (category == null) {
            return null;
        }

        WasteCategoryDTO dto = new WasteCategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        
        if (category.getDisposalGuidelines() != null) {
            dto.setDisposalGuidelines(category.getDisposalGuidelines().stream()
                .map(this::toGuidelineDTO)
                .collect(Collectors.toList()));
        }
        
        if (category.getRecyclingTips() != null) {
            dto.setRecyclingTips(category.getRecyclingTips().stream()
                .map(this::toTipDTO)
                .collect(Collectors.toList()));
        }
        
        return dto;
    }

    public WasteCategory toEntity(WasteCategoryDTO dto) {
        if (dto == null) {
            return null;
        }

        WasteCategory category = new WasteCategory();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        return category;
    }

    private DisposalGuidelineDTO toGuidelineDTO(DisposalGuideline guideline) {
        DisposalGuidelineDTO dto = new DisposalGuidelineDTO();
        dto.setId(guideline.getId());
        dto.setTitle(guideline.getTitle());
        dto.setInstructions(guideline.getInstructions());
        return dto;
    }

    private RecyclingTipDTO toTipDTO(RecyclingTip tip) {
        RecyclingTipDTO dto = new RecyclingTipDTO();
        dto.setId(tip.getId());
        dto.setTitle(tip.getTitle());
        dto.setSteps(tip.getSteps()); // Direct assignment since both use List<String>
        dto.setDifficulty(tip.getDifficulty());
        dto.setEnvironmentalImpact(tip.getEnvironmentalImpact());
        dto.setTimeRequired(tip.getTimeRequired());
        dto.setRequiredMaterials(tip.getRequiredMaterials());
        return dto;
    }

    public void updateEntity(WasteCategory category, WasteCategoryDTO dto) {
        if (category == null || dto == null) {
            throw new IllegalArgumentException("Category and DTO must not be null");
        }

        // Selectively update only non-null fields
        if (dto.getName() != null) {
            category.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            category.setDescription(dto.getDescription());
        }
        // Additional fields can be added here
    }
}


