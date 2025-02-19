package com.enviro.assessment.grad001.thabanglenonyana.waste_management.category;

import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline.DisposalGuideline;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline.DisposalGuidelineDTO;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip.RecyclingTip;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip.RecyclingTipDTO;

@Component
public class WasteCategoryMapper {
    
    public WasteCategoryDTO toDTO(WasteCategory category) {
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
        WasteCategory category = new WasteCategory();
        updateEntity(category, dto);
        return category;
    }

    public void updateEntity(WasteCategory category, WasteCategoryDTO dto) {
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        
        if (dto.getDisposalGuidelines() != null) {
            Set<DisposalGuideline> guidelines = dto.getDisposalGuidelines().stream()
                .map(guidelineDto -> toGuidelineEntity(guidelineDto, category))
                .collect(Collectors.toSet());
            category.getDisposalGuidelines().clear();
            category.getDisposalGuidelines().addAll(guidelines);
        }
        
        if (dto.getRecyclingTips() != null) {
            Set<RecyclingTip> tips = dto.getRecyclingTips().stream()
                .map(tipDto -> toTipEntity(tipDto, category))
                .collect(Collectors.toSet());
            category.getRecyclingTips().clear();
            category.getRecyclingTips().addAll(tips);
        }
    }

    private DisposalGuidelineDTO toGuidelineDTO(DisposalGuideline guideline) {
        DisposalGuidelineDTO dto = new DisposalGuidelineDTO();
        dto.setTitle(guideline.getTitle());
        dto.setInstructions(guideline.getInstructions());
        return dto;
    }

    private RecyclingTipDTO toTipDTO(RecyclingTip tip) {
        RecyclingTipDTO dto = new RecyclingTipDTO();
        dto.setTitle(tip.getTitle());
        dto.setContent(tip.getContent());
        return dto;
    }

    private DisposalGuideline toGuidelineEntity(DisposalGuidelineDTO dto, WasteCategory category) {
        DisposalGuideline guideline = new DisposalGuideline();
        guideline.setTitle(dto.getTitle());
        guideline.setInstructions(dto.getInstructions());
        return guideline;
    }

    private RecyclingTip toTipEntity(RecyclingTipDTO dto, WasteCategory category) {
        RecyclingTip tip = new RecyclingTip();
        tip.setTitle(dto.getTitle());
        tip.setContent(dto.getContent());
        return tip;
    }
}

