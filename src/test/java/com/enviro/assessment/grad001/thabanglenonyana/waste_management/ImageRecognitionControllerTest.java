package com.enviro.assessment.grad001.thabanglenonyana.waste_management;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;

import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;


import com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility.RecyclingLocation;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline.DisposalGuideline;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.image_analysis.ImageAnalysisResponse;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.image_analysis.ImageRecognitionController;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.image_analysis.ImageRecognitionService;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.image_analysis.RecognizedMaterial;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip.RecyclingTip;

@WebMvcTest(ImageRecognitionController.class)
public class ImageRecognitionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ImageRecognitionService imageRecognitionService;

    private MockMultipartFile imageFile;
    private ImageAnalysisResponse mockResponse;
    private RecognizedMaterial mockMaterial;

    @BeforeEach
    void setUp() {
        // Create mock image file
        imageFile = new MockMultipartFile(
            "file",
            "test-image.jpg",
            MediaType.IMAGE_JPEG_VALUE,
            "test image content".getBytes()
        );

        // Create mock recognized material
        mockMaterial = new RecognizedMaterial(
            "plastic",
            Arrays.asList("bottle", "plastic"),
            0.85,
            "Rinse and place in recycling bin",
            true,
            1L
        );

        // Create sample disposal guidelines
        DisposalGuideline guideline = new DisposalGuideline();
        guideline.setId(1L);
        guideline.setInstructions("Rinse and place in recycling bin");
        List<DisposalGuideline> guidelines = Collections.singletonList(guideline);

        // Create sample recycling tips
        RecyclingTip tip = new RecyclingTip();
        tip.setId(1L);
        tip.setSteps(Collections.singletonList("Remove caps before recycling"));
        List<RecyclingTip> tips = Collections.singletonList(tip);

        // Create sample nearby locations
        RecyclingLocation location = new RecyclingLocation();
        location.setId(1L);
        location.setName("Recycling Center");
        location.setLatitude(34.0522);
        location.setLongitude(-118.2437);
        location.setType("Recycling Center");
        location.setAcceptsPlastic(true);
        List<RecyclingLocation> locations = Collections.singletonList(location);

        // Create mock response
        mockResponse = new ImageAnalysisResponse(mockMaterial, locations, guidelines, tips);
    }

    @Test
    void analyzeImage_ValidRequest_ReturnsSuccessResponse() throws Exception {
        // Arrange
        Double latitude = 34.0522;
        Double longitude = -118.2437;
        Integer radius = 10;

        when(imageRecognitionService.analyzeImage(any(), eq(latitude), eq(longitude), eq(radius)))
            .thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(multipart("/api/image-recognition/analyze")
                .file(imageFile)
                .param("latitude", latitude.toString())
                .param("longitude", longitude.toString())
                .param("radius", radius.toString()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.material.materialName").value("plastic"))
            .andExpect(jsonPath("$.material.recyclable").value(true))
            .andExpect(jsonPath("$.nearbyLocations[0].name").value("Recycling Center"))
            .andExpect(jsonPath("$.disposalGuidelines[0].instructions").value("Rinse and place in recycling bin"))
            .andExpect(jsonPath("$.recyclingTips[0].content").value("Remove caps before recycling"));
    }

    @Test
    void analyzeImage_WithoutLocation_ReturnsSuccessResponse() throws Exception {
        // Arrange
        ImageAnalysisResponse responseWithoutLocations = new ImageAnalysisResponse(
            mockMaterial,
            Collections.emptyList(),
            Collections.emptyList(),
            Collections.emptyList()
        );

        when(imageRecognitionService.analyzeImage(any(), isNull(), isNull(), isNull()))
            .thenReturn(responseWithoutLocations);

        // Act & Assert
        mockMvc.perform(multipart("/api/image-recognition/analyze")
                .file(imageFile))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.material.materialName").value("plastic"))
            .andExpect(jsonPath("$.material.recyclable").value(true))
            .andExpect(jsonPath("$.nearbyLocations").isArray())
            .andExpect(jsonPath("$.nearbyLocations").isEmpty());
    }

    @Test
    void analyzeImage_EmptyFile_ReturnsBadRequest() throws Exception {
        // Arrange
        MockMultipartFile emptyFile = new MockMultipartFile(
            "file",
            "empty.jpg",
            MediaType.IMAGE_JPEG_VALUE,
            new byte[0]
        );

        // Act & Assert
        mockMvc.perform(multipart("/api/image-recognition/analyze")
                .file(emptyFile)
                .param("latitude", "34.0522")
                .param("longitude", "-118.2437"))
            .andExpect(status().isBadRequest());

        // Verify service was not called
        verify(imageRecognitionService, never()).analyzeImage(any(), any(), any(), any());
    }

    @Test
    void analyzeImage_ServiceThrowsIOException_ReturnsInternalServerError() throws Exception {
        // Arrange
        when(imageRecognitionService.analyzeImage(any(), any(), any(), any()))
            .thenThrow(new IOException("Error processing image"));

        // Act & Assert
        mockMvc.perform(multipart("/api/image-recognition/analyze")
                .file(imageFile)
                .param("latitude", "34.0522")
                .param("longitude", "-118.2437"))
            .andExpect(status().isInternalServerError());
    }

    @Test
    void analyzeImage_ServiceThrowsRuntimeException_ReturnsInternalServerError() throws Exception {
        // Arrange
        when(imageRecognitionService.analyzeImage(any(), any(), any(), any()))
            .thenThrow(new RuntimeException("Unexpected error"));

        // Act & Assert
        mockMvc.perform(multipart("/api/image-recognition/analyze")
                .file(imageFile)
                .param("latitude", "34.0522")
                .param("longitude", "-118.2437"))
            .andExpect(status().isInternalServerError());
    }
}