package com.enviro.assessment.grad001.thabanglenonyana.waste_management.image_analysis;

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility.RecyclingLocation;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline.DisposalGuideline;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip.RecyclingTip;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImageAnalysisResponse {
    private RecognizedMaterial material;
    private List<RecyclingLocation> nearbyLocations;
    private List<DisposalGuideline> disposalGuidelines;
    private List<RecyclingTip> recyclingTips;
}
