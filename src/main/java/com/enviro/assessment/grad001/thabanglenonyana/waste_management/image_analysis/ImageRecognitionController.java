package com.enviro.assessment.grad001.thabanglenonyana.waste_management.image_analysis;



import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/image-recognition")
public class ImageRecognitionController {

    private static final Logger logger = LoggerFactory.getLogger(ImageRecognitionController.class);
    private final ImageRecognitionService imageRecognitionService;

    @Autowired
    public ImageRecognitionController(ImageRecognitionService imageRecognitionService) {
        this.imageRecognitionService = imageRecognitionService;
    }

    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImageAnalysisResponse> analyzeImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) Integer radius) {
        
        try {
            logger.info("Received image analysis request with coordinates: lat={}, lon={}, radius={}",
                    latitude, longitude, radius);
            
            if (file.isEmpty()) {
                logger.warn("Empty file received for analysis");
                return ResponseEntity.badRequest().build();
            }
            
            ImageAnalysisResponse response = imageRecognitionService.analyzeImage(file, latitude, longitude, radius);
            logger.info("Analysis complete. Found {} objects, {} nearby locations", 
                    response.getMaterial().getDetectedObjects().size(),
                    response.getNearbyLocations().size());
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            logger.error("Error processing image file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            logger.error("Unexpected error during image analysis", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}