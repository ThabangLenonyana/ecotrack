package com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip;

import org.springframework.stereotype.Component;

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.category.WasteCategory;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.category.WasteCategoryDTO;

/**
 * Mapper class for converting between RecyclingTip entities and DTOs
 */
@Component
public class RecyclingTipMapper {
    
    /**
     * Converts a RecyclingTip entity to its DTO representation
     * @param tip The RecyclingTip entity to convert
     * @return RecyclingTipDTO with mapped data
     */
    public RecyclingTipDTO toDTO(RecyclingTip tip) {
        if (tip == null) {
            return null;
        }

        RecyclingTipDTO dto = new RecyclingTipDTO();
        dto.setId(tip.getId());
        dto.setTitle(tip.getTitle());
        dto.setSteps(tip.getSteps()); // Direct assignment since both use List<String>
        dto.setDifficulty(tip.getDifficulty());
        dto.setEnvironmentalImpact(tip.getEnvironmentalImpact());
        dto.setTimeRequired(tip.getTimeRequired());
        dto.setRequiredMaterials(tip.getRequiredMaterials());
        
        // Safe category mapping with null checks
        if (tip.getCategory() != null) {
            dto.setCategoryId(tip.getCategory().getId());
            WasteCategory category = tip.getCategory();
            WasteCategoryDTO catDTO = new WasteCategoryDTO();
            catDTO.setId(category.getId());
            catDTO.setName(category.getName());
            dto.setCategory(catDTO);
        }
        
        return dto;
    }

    /**
     * Creates a new RecyclingTip entity from DTO data
     * @param dto The DTO containing the tip data
     * @return New RecyclingTip entity or null if input is null
     */
    public RecyclingTip toEntity(RecyclingTipDTO dto) {
        if (dto == null) {
            return null;
        }

        RecyclingTip tip = new RecyclingTip();
        tip.setId(dto.getId());
        tip.setTitle(dto.getTitle());
        tip.setSteps(dto.getSteps()); // Direct assignment since both use List<String>
        tip.setDifficulty(dto.getDifficulty());
        tip.setEnvironmentalImpact(dto.getEnvironmentalImpact());
        tip.setTimeRequired(dto.getTimeRequired());
        tip.setRequiredMaterials(dto.getRequiredMaterials());
        
        return tip;
    }

    /**
     * Updates an existing RecyclingTip entity with data from DTO
     * Only updates non-null fields from the DTO
     * @param tip The existing RecyclingTip entity to update
     * @param dto The DTO containing update data
     * @throws IllegalArgumentException if either parameter is null
     */
    public void updateEntity(RecyclingTip tip, RecyclingTipDTO dto) {
        if (tip == null || dto == null) {
            throw new IllegalArgumentException("Both tip and DTO must not be null");
        }

        // Selectively update only non-null fields
        if (dto.getTitle() != null) {
            tip.setTitle(dto.getTitle());
        }
        if (dto.getSteps() != null) {
            tip.setSteps(dto.getSteps()); // Direct assignment since both use List<String>
        }
        if (dto.getDifficulty() != null) {
            tip.setDifficulty(dto.getDifficulty());
        }
        if (dto.getEnvironmentalImpact() != null) {
            tip.setEnvironmentalImpact(dto.getEnvironmentalImpact());
        }
        if (dto.getTimeRequired() != null) {
            tip.setTimeRequired(dto.getTimeRequired());
        }
        if (dto.getRequiredMaterials() != null) {
            tip.setRequiredMaterials(dto.getRequiredMaterials());
        }
    }

    /**
     * Sets the category for a RecyclingTip entity
     * @param tip The RecyclingTip entity to update
     * @param category The WasteCategory to associate
     */
    public void setCategory(RecyclingTip tip, WasteCategory category) {
        if (tip != null) {
            tip.setCategory(category);
        }   
    }
}
