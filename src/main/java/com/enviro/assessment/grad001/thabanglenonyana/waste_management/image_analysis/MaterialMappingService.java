package com.enviro.assessment.grad001.thabanglenonyana.waste_management.image_analysis;

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.category.WasteCategory;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.category.WasteCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MaterialMappingService {
    
    private final Map<String, String> objectToMaterialMap = new HashMap<>();
    private final WasteCategoryService wasteCategoryService;
    
    @Autowired
    public MaterialMappingService(WasteCategoryService wasteCategoryService) {
        this.wasteCategoryService = wasteCategoryService;
        initializeObjectToMaterialMap();
    }
    
    private void initializeObjectToMaterialMap() {
        // Plastic items
        objectToMaterialMap.put("plastic bottle", "plastic");
        objectToMaterialMap.put("water bottle", "plastic");
        objectToMaterialMap.put("soda bottle", "plastic");
        objectToMaterialMap.put("plastic container", "plastic");
        
        // Paper items
        objectToMaterialMap.put("newspaper", "paper");
        objectToMaterialMap.put("cardboard", "paper");
        objectToMaterialMap.put("cardboard box", "paper");
        objectToMaterialMap.put("magazine", "paper");
        
        // Glass items
        objectToMaterialMap.put("glass bottle", "glass");
        objectToMaterialMap.put("wine bottle", "glass");
        objectToMaterialMap.put("beer bottle", "glass");
        objectToMaterialMap.put("glass jar", "glass");
        
        // Metal items
        objectToMaterialMap.put("can", "metal");
        objectToMaterialMap.put("aluminum can", "metal");
        objectToMaterialMap.put("tin can", "metal");
        objectToMaterialMap.put("soda can", "metal");
        
        // Electronic items
        objectToMaterialMap.put("phone", "electronic");
        objectToMaterialMap.put("computer", "electronic");
        objectToMaterialMap.put("laptop", "electronic");
        objectToMaterialMap.put("television", "electronic");
        
        // Organic items
        objectToMaterialMap.put("food", "organic");
        objectToMaterialMap.put("fruit", "organic");
        objectToMaterialMap.put("vegetable", "organic");
    }
    
    public String mapObjectToMaterial(List<String> detectedObjects) {
        for (String object : detectedObjects) {
            String material = objectToMaterialMap.get(object.toLowerCase());
            if (material != null) {
                return material;
            }
        }
        return "unknown";
    }
    
    public WasteCategory getWasteCategoryForMaterial(String material) {
        // Map material to a waste category from database
        switch (material.toLowerCase()) {
            case "plastic":
            case "glass":
            case "metal":
                return wasteCategoryService.findByCategoryName("recyclable");
            case "paper":
                return wasteCategoryService.findByCategoryName("paper");
            case "organic":
                return wasteCategoryService.findByCategoryName("organic");
            case "electronic":
                return wasteCategoryService.findByCategoryName("e-waste");
            default:
                return wasteCategoryService.findByCategoryName("general waste");
        }
    }
    
    public boolean isRecyclable(String material) {
        return !material.equals("unknown");
    }
}
