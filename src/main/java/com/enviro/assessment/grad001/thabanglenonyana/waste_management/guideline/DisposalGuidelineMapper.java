package com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline;

import org.springframework.stereotype.Component;

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.category.WasteCategory;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.category.WasteCategoryDTO;  // assuming it exists

/**
 * Mapper class for converting between DisposalGuideline entities and DTOs
 */
@Component
public class DisposalGuidelineMapper {

    /**
     * Converts a DisposalGuideline entity to DTO with null safety
     * @param guideline The entity to convert
     * @return DisposalGuidelineDTO or null if input is null
     */
    public DisposalGuidelineDTO toDTO(DisposalGuideline guideline) {
        if (guideline == null) {
            return null;
        }

        DisposalGuidelineDTO dto = new DisposalGuidelineDTO();
        dto.setId(guideline.getId());
        dto.setTitle(guideline.getTitle());
        dto.setInstructions(guideline.getInstructions());
        
        // Safe navigation for category and set complete info
        if (guideline.getCategory() != null) {
            dto.setCategoryId(guideline.getCategory().getId());
            WasteCategory category = guideline.getCategory();
            WasteCategoryDTO catDTO = new WasteCategoryDTO();
            catDTO.setId(category.getId());
            catDTO.setName(category.getName());
            dto.setCategory(catDTO);
        }
        
        return dto;
    }

    /**
     * Converts a DisposalGuidelineDTO to entity with null safety
     * @param dto The DTO to convert
     * @return DisposalGuideline or null if input is null
     */
    public DisposalGuideline toEntity(DisposalGuidelineDTO dto) {
        if (dto == null) {
            return null;
        }

        DisposalGuideline guideline = new DisposalGuideline();
        guideline.setId(dto.getId());
        guideline.setTitle(dto.getTitle());
        guideline.setInstructions(dto.getInstructions());
        
        // Category will be set by the service layer
        return guideline;
    }

    /**
     * Updates an existing DisposalGuideline entity with DTO data
     * @param guideline The entity to update
     * @param dto The DTO containing update data
     * @throws IllegalArgumentException if either parameter is null
     */
    public void updateEntity(DisposalGuideline guideline, DisposalGuidelineDTO dto) {
        if (guideline == null || dto == null) {
            throw new IllegalArgumentException("Both guideline and DTO must not be null");
        }

        // Update only non-null fields
        if (dto.getTitle() != null) {
            guideline.setTitle(dto.getTitle());
        }
        if (dto.getInstructions() != null) {
            guideline.setInstructions(dto.getInstructions());
        }
    }

    /**
     * Sets the category for a guideline
     * @param guideline The guideline to update
     * @param category The category to set
     */
    public void setCategory(DisposalGuideline guideline, WasteCategory category) {
        if (guideline != null) {
            guideline.setCategory(category);
        }
    }
    
}
