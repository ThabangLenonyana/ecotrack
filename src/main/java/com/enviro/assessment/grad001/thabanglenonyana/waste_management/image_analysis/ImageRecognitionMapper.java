package com.enviro.assessment.grad001.thabanglenonyana.waste_management.image_analysis;

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility.RecyclingLocationMapper;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline.DisposalGuidelineMapper;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip.RecyclingTipMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring",uses = {
    RecyclingLocationMapper.class,
    DisposalGuidelineMapper.class,
    RecyclingTipMapper.class
})
public interface ImageRecognitionMapper {
    
    
    RecognizedMaterialDTO toDto(RecognizedMaterial material);
    
    ImageAnalysisResponseDTO toDto(ImageAnalysisResponse response);
}
