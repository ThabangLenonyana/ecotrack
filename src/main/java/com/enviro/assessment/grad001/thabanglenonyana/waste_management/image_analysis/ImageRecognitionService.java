package com.enviro.assessment.grad001.thabanglenonyana.waste_management.image_analysis;

import com.azure.ai.vision.imageanalysis.ImageAnalysisClient;
import com.azure.ai.vision.imageanalysis.models.*;
import com.azure.core.util.BinaryData;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.category.WasteCategory;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility.RecyclingLocation;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility.RecyclingLocationDTO;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility.RecyclingLocationService;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline.DisposalGuideline;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline.DisposalGuidelineService;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip.RecyclingTip;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip.RecyclingTipService;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;



@Service
public class ImageRecognitionService {

    private static final Logger logger = LoggerFactory.getLogger(ImageRecognitionService.class);
    
    private final ImageAnalysisClient imageAnalysisClient;
    private final MaterialMappingService materialMappingService;
    private final RecyclingLocationService recyclingLocationService;


    @Autowired
    public ImageRecognitionService(
            ImageAnalysisClient imageAnalysisClient,
            MaterialMappingService materialMappingService,
            RecyclingLocationService recyclingLocationService,
            DisposalGuidelineService disposalGuidelineService,
            RecyclingTipService recyclingTipService) {
        this.imageAnalysisClient = imageAnalysisClient;
        this.materialMappingService = materialMappingService;
        this.recyclingLocationService = recyclingLocationService;
    }

    public ImageAnalysisResponse analyzeImage(MultipartFile file, Double latitude, Double longitude, Integer radius) 
            throws IOException {
        logger.info("Analyzing image with coordinates: lat={}, long={}, radius={}km", latitude, longitude, radius);
        
        // Convert MultipartFile to byte array for direct API call
        byte[] imageBytes = file.getBytes();
        
        // Analyze with Azure AI Vision directly
        ImageAnalysisResult analysisResult = analyzeImage(imageBytes);
        
        // Extract tags
        List<String> detectedObjects = extractTags(analysisResult);
        logger.info("Detected objects: {}", detectedObjects);
        
        // Map to material
        String material = materialMappingService.mapObjectToMaterial(detectedObjects);
        boolean recyclable = materialMappingService.isRecyclable(material);
        logger.info("Mapped to material: {}, recyclable: {}", material, recyclable);
        
        // Get highest confidence score
        double confidenceScore = getHighestConfidenceScore(analysisResult);
        
        // Get waste category for this material
        WasteCategory wasteCategory = materialMappingService.getWasteCategoryForMaterial(material);
        logger.info("Waste category: {} (ID: {})", wasteCategory.getName(), wasteCategory.getId());
        
        // Get disposal guidelines from waste category
        List<DisposalGuideline> guidelines = wasteCategory.getDisposalGuidelines() != null ? 
            wasteCategory.getDisposalGuidelines() : Collections.emptyList();
        
        // Get instructions from the first guideline if available
        String instructions = !guidelines.isEmpty() ? 
            guidelines.get(0).getInstructions() : "No specific instructions available.";
        
        // Create material object
        RecognizedMaterial recognizedMaterial = new RecognizedMaterial(
                material,
                detectedObjects,
                confidenceScore,
                instructions,
                recyclable,
                wasteCategory.getId()
        );
        
        // Find recycling locations if coordinates provided
        List<RecyclingLocationDTO> locationDTOs = new ArrayList<>();
        if (latitude != null && longitude != null) {
            Double searchRadius = radius != null ? radius : 10.0;
            // Get locations from the service
            locationDTOs = recyclingLocationService.findNearbyLocations(latitude, longitude, searchRadius);
            logger.info("Found {} nearby locations within {}km", locationDTOs.size(), searchRadius);
        }
        
        // Improved filtering for locations by waste category
        List<RecyclingLocation> locations = convertAndFilterLocationsByWasteCategory(locationDTOs, wasteCategory);
        logger.info("After filtering by waste category: {} locations remain", locations.size());
        
        // Get recycling tips directly from waste category
        List<RecyclingTip> tips = wasteCategory.getRecyclingTips() != null ? 
            wasteCategory.getRecyclingTips() : Collections.emptyList();
        
        return new ImageAnalysisResponse(recognizedMaterial, locations, guidelines, tips);
    }
    
    // Helper method to analyze image with proper Azure SDK usage
    private ImageAnalysisResult analyzeImage(byte[] imageBytes) {
        // Convert byte array to BinaryData
        BinaryData binaryData = BinaryData.fromBytes(imageBytes);
        
        // Configure analysis options
        ImageAnalysisOptions options = new ImageAnalysisOptions()
            .setLanguage("en")
            .setModelVersion("latest");
            
        // Specify the visual features we need for waste identification
        List<VisualFeatures> visualFeatures = Arrays.asList(
            VisualFeatures.OBJECTS,
            VisualFeatures.TAGS
        );
        
        logger.debug("Calling Azure Vision API for image analysis");
        // Call the Azure AI Vision service with proper parameters
        return imageAnalysisClient.analyze(
            binaryData,
            visualFeatures,
            options
        );
    }
    
    // Improved helper method with better waste category matching
    private List<RecyclingLocation> convertAndFilterLocationsByWasteCategory(
            List<RecyclingLocationDTO> dtos, WasteCategory wasteCategory) {
        if (dtos == null || dtos.isEmpty()) {
            logger.info("No location DTOs provided to filter");
            return Collections.emptyList();
        }
        
        String categoryName = wasteCategory.getName().toLowerCase();
        Long categoryId = wasteCategory.getId();
        
        List<RecyclingLocation> filteredLocations = new ArrayList<>();
        
        for (RecyclingLocationDTO dto : dtos) {
            boolean shouldInclude = false;
            
            // Check using acceptedMaterials Map instead
            if (dto.getAcceptedMaterials() != null) {
                if (dto.getAcceptedMaterials().containsKey("paper") && 
                    Boolean.TRUE.equals(dto.getAcceptedMaterials().get("paper")) && 
                    "paper".equalsIgnoreCase(categoryName)) {
                    shouldInclude = true;
                } else if (dto.getAcceptedMaterials().containsKey("plastic") && 
                          Boolean.TRUE.equals(dto.getAcceptedMaterials().get("plastic")) && 
                          "plastic".equalsIgnoreCase(categoryName)) {
                    shouldInclude = true;
                } else if (dto.getAcceptedMaterials().containsKey("metal") && 
                          Boolean.TRUE.equals(dto.getAcceptedMaterials().get("metal")) && 
                          "metal".equalsIgnoreCase(categoryName)) {
                    shouldInclude = true;
                } else if (dto.getAcceptedMaterials().containsKey("ewaste") && 
                          Boolean.TRUE.equals(dto.getAcceptedMaterials().get("ewaste")) && 
                          "electronic".equalsIgnoreCase(categoryName)) {
                    shouldInclude = true;
                } else if (dto.getAcceptedMaterials().containsKey("cardboard") && 
                          Boolean.TRUE.equals(dto.getAcceptedMaterials().get("cardboard")) && 
                          "cardboard".equalsIgnoreCase(categoryName)) {
                    shouldInclude = true;
                } else if (dto.getAcceptedMaterials().containsKey(String.valueOf(categoryId)) || 
                          dto.getAcceptedMaterials().containsKey(categoryName)) {
                    shouldInclude = true;
                }
            }
            
            if (shouldInclude) {
                filteredLocations.add(convertToLocation(dto));
                logger.debug("Including location: {} for waste category: {}", dto.getName(), categoryName);
            }
        }
        
        return filteredLocations;
    }
    
    // Helper method to convert DTO to entity
    private RecyclingLocation convertToLocation(RecyclingLocationDTO dto) {
        RecyclingLocation location = new RecyclingLocation();
        // Map properties from DTO to entity
        location.setId(dto.getId());
        location.setName(dto.getName());
        location.setLatitude(dto.getLatitude());
        location.setLongitude(dto.getLongitude());
        location.setType(dto.getType());
        location.setCity(dto.getCity());
        location.setMunicipality(dto.getMunicipality());
        location.setWebsite(dto.getWebsite());
        
        // Set boolean properties based on acceptedMaterials map
        Map<String, Boolean> materials = dto.getAcceptedMaterials();
        if (materials != null) {
            location.setAcceptsPaper(Boolean.TRUE.equals(materials.get("paper")));
            location.setAcceptsPlastic(Boolean.TRUE.equals(materials.get("plastic")));
            location.setAcceptsCardboard(Boolean.TRUE.equals(materials.get("cardboard")));
            location.setAcceptsMetal(Boolean.TRUE.equals(materials.get("metal")));
            location.setAcceptsEWaste(Boolean.TRUE.equals(materials.get("ewaste")));
            location.setAcceptsMotorOil(Boolean.TRUE.equals(materials.get("motorOil")));
            location.setAcceptsCartons(Boolean.TRUE.equals(materials.get("cartons")));
            location.setAcceptsCans(Boolean.TRUE.equals(materials.get("cans")));
        }
        
        return location;
    }

    private List<String> extractTags(ImageAnalysisResult analysisResult) {
        List<String> tags = new ArrayList<>();
        
        // Extract tags
        if (analysisResult.getTags() != null) {
            for (DetectedTag tag : analysisResult.getTags().getValues()) {
                if (tag.getConfidence() > 0.6) {
                    tags.add(tag.getName());
                }
            }
        }
        
        // Extract objects
        if (analysisResult.getObjects() != null) {
            for (DetectedObject obj : analysisResult.getObjects().getValues()) {
                if (!obj.getTags().isEmpty()) {
                    tags.add(obj.getTags().get(0).getName());
                }
            }
        }
        
        return tags;
    }

    private double getHighestConfidenceScore(ImageAnalysisResult analysisResult) {
        double highestScore = 0.0;
        
        if (analysisResult.getTags() != null) {
            for (DetectedTag tag : analysisResult.getTags().getValues()) {
                if (tag.getConfidence() > highestScore) {
                    highestScore = tag.getConfidence();
                }
            }
        }
        
        return highestScore;
    }
}