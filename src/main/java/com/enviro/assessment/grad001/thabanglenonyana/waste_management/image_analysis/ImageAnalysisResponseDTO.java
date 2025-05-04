package com.enviro.assessment.grad001.thabanglenonyana.waste_management.image_analysis;

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility.RecyclingLocationDTO;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline.DisposalGuidelineDTO;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip.RecyclingTipDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImageAnalysisResponseDTO {
    private RecognizedMaterialDTO material;
    private List<RecyclingLocationDTO> nearbyLocations;
    private List<DisposalGuidelineDTO> disposalGuidelines;
    private List<RecyclingTipDTO> recyclingTips;
}