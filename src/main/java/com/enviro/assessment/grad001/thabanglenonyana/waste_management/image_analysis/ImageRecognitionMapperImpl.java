package com.enviro.assessment.grad001.thabanglenonyana.waste_management.image_analysis;

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility.RecyclingLocationMapper;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline.DisposalGuidelineMapper;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip.RecyclingTipMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.stream.Collectors;

@Component
public class ImageRecognitionMapperImpl implements ImageRecognitionMapper {
    
    private final RecyclingLocationMapper recyclingLocationMapper;
    private final DisposalGuidelineMapper disposalGuidelineMapper;
    private final RecyclingTipMapper recyclingTipMapper;
    
    @Autowired
    public ImageRecognitionMapperImpl(
            RecyclingLocationMapper recyclingLocationMapper,
            DisposalGuidelineMapper disposalGuidelineMapper,
            RecyclingTipMapper recyclingTipMapper) {
        this.recyclingLocationMapper = recyclingLocationMapper;
        this.disposalGuidelineMapper = disposalGuidelineMapper;
        this.recyclingTipMapper = recyclingTipMapper;
    }
    
    @Override
    public RecognizedMaterialDTO toDto(RecognizedMaterial material) {
        if (material == null) {
            return null;
        }
        
        RecognizedMaterialDTO dto = new RecognizedMaterialDTO();
        dto.setMaterialType(material.getMaterialType());
        dto.setDetectedObjects(material.getDetectedObjects());
        dto.setConfidenceScore(material.getConfidenceScore());
        dto.setRecyclingInstructions(material.getRecyclingInstructions());
        dto.setRecyclable(material.isRecyclable());
        dto.setWasteCategoryId(material.getWasteCategoryId());
        
        return dto;
    }
    
    @Override
    public ImageAnalysisResponseDTO toDto(ImageAnalysisResponse response) {
        if (response == null) {
            return null;
        }
        
        ImageAnalysisResponseDTO dto = new ImageAnalysisResponseDTO();
        dto.setMaterial(toDto(response.getMaterial()));
        
        if (response.getNearbyLocations() != null) {
            dto.setNearbyLocations(response.getNearbyLocations().stream()
                .map(recyclingLocationMapper::toDto)
                .collect(Collectors.toList()));
        }
        
        if (response.getDisposalGuidelines() != null) {
            dto.setDisposalGuidelines(response.getDisposalGuidelines().stream()
                .map(disposalGuidelineMapper::toDTO)
                .collect(Collectors.toList()));
        }
        
        if (response.getRecyclingTips() != null) {
            dto.setRecyclingTips(response.getRecyclingTips().stream()
                .map(recyclingTipMapper::toDTO)
                .collect(Collectors.toList()));
        } else {
            dto.setRecyclingTips(new ArrayList<>());
        }
        
        return dto;
    }
}