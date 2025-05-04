package com.enviro.assessment.grad001.thabanglenonyana.waste_management;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import com.azure.ai.vision.imageanalysis.models.ObjectsResult;
import com.azure.ai.vision.imageanalysis.models.TagsResult;
import com.azure.ai.vision.imageanalysis.ImageAnalysisClient;
import com.azure.ai.vision.imageanalysis.models.DetectedObject;
import com.azure.ai.vision.imageanalysis.models.DetectedTag;
import com.azure.ai.vision.imageanalysis.models.ImageAnalysisResult;
import com.azure.core.util.BinaryData;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.category.WasteCategory;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility.RecyclingLocationDTO;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility.RecyclingLocationService;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline.DisposalGuideline;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline.DisposalGuidelineService;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.image_analysis.ImageAnalysisResponse;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.image_analysis.ImageRecognitionService;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.image_analysis.MaterialMappingService;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip.RecyclingTip;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip.RecyclingTipService;

@ExtendWith(MockitoExtension.class)
public class ImageRecognitionServiceTest {

    @Mock
    private ImageAnalysisClient imageAnalysisClient;

    @Mock
    private MaterialMappingService materialMappingService;

    @Mock
    private RecyclingLocationService recyclingLocationService;

    @Mock
    private DisposalGuidelineService disposalGuidelineService;

    @Mock
    private RecyclingTipService recyclingTipService;

    @InjectMocks
    private ImageRecognitionService imageRecognitionService;

    private MultipartFile mockImageFile;
    private ImageAnalysisResult mockAnalysisResult;
    private WasteCategory mockWasteCategory;
    private DisposalGuideline mockGuideline;
    private RecyclingTip mockTip;

    @BeforeEach
    void setUp() {
        // Mock MultipartFile
        mockImageFile = new MockMultipartFile(
            "test.jpg",
            "test.jpg",
            "image/jpeg",
            "test image content".getBytes()
        );

        // Setup mock objects
        mockAnalysisResult = mock(ImageAnalysisResult.class);
        
        // Mock waste category
        mockWasteCategory = new WasteCategory();
        mockWasteCategory.setId(1L);
        mockWasteCategory.setName("Plastic");
        
        // Mock disposal guideline
        mockGuideline = new DisposalGuideline();
        mockGuideline.setId(1L);
        mockGuideline.setInstructions("Rinse and recycle");
        
        // Set guidelines to waste category
        mockWasteCategory.setDisposalGuidelines(Collections.singletonList(mockGuideline));
        
        // Mock recycling tip
        mockTip = new RecyclingTip();
        mockTip.setId(1L);
        mockTip.setSteps(Collections.singletonList("Remove caps before recycling"));
        
        // Set tips to waste category
        mockWasteCategory.setRecyclingTips(Collections.singletonList(mockTip));
    }

    @Test
    void analyzeImage_WithValidInputAndLocation_ReturnsCompleteResponse() throws IOException {
        // Arrange
        Double latitude = 34.0522;
        Double longitude = -118.2437;
        Integer radius = 10;
        
        // Mock tag results
        TagsResult mockTagResult = mock(TagsResult.class);
        DetectedTag mockTag = mock(DetectedTag.class);
        when(mockTag.getName()).thenReturn("plastic bottle");
        when(mockTag.getConfidence()).thenReturn(0.85);
        when(mockTagResult.getValues()).thenReturn(Collections.singletonList(mockTag));
        when(mockAnalysisResult.getTags()).thenReturn(mockTagResult);
        
        // Mock object results
        ObjectsResult mockObjectResult = mock(ObjectsResult.class);
        DetectedObject mockObject = mock(DetectedObject.class);
        when(mockObject.getTags()).thenReturn(Collections.singletonList(mockTag));
        when(mockObjectResult.getValues()).thenReturn(Collections.singletonList(mockObject));
        when(mockAnalysisResult.getObjects()).thenReturn(mockObjectResult);
        
        // Mock material mapping response
        when(materialMappingService.mapObjectToMaterial(anyList())).thenReturn("plastic");
        when(materialMappingService.isRecyclable("plastic")).thenReturn(true);
        when(materialMappingService.getWasteCategoryForMaterial("plastic")).thenReturn(mockWasteCategory);
        
        // Mock Azure AI Vision client response
        when(imageAnalysisClient.analyze(any(BinaryData.class), anyList(), any())).thenReturn(mockAnalysisResult);
        
        // Mock recycling location service response
        RecyclingLocationDTO mockLocationDTO = new RecyclingLocationDTO();
        mockLocationDTO.setId(1L);
        mockLocationDTO.setName("Recycling Center");
        mockLocationDTO.setLatitude(34.0500);
        mockLocationDTO.setLongitude(-118.2400);
        mockLocationDTO.setType("Recycling Center");
        
        // Create acceptedMaterials map
        Map<String, Boolean> acceptedMaterials = new HashMap<>();
        acceptedMaterials.put("plastic", true);
        mockLocationDTO.setAcceptedMaterials(acceptedMaterials);
        
        when(recyclingLocationService.findNearbyLocations(latitude, longitude, radius.doubleValue()))
            .thenReturn(Collections.singletonList(mockLocationDTO));

        // Act
        ImageAnalysisResponse response = imageRecognitionService.analyzeImage(mockImageFile, latitude, longitude, radius);

        // Assert
        assertNotNull(response, "Response should not be null");
        assertNotNull(response.getMaterial(), "RecognizedMaterial should not be null");
        assertEquals("plastic", response.getMaterial().getMaterialType(), "Material name should match");
        assertTrue(response.getMaterial().isRecyclable(), "Material should be recyclable");
        assertFalse(response.getNearbyLocations().isEmpty(), "Nearby locations should not be empty");
        assertEquals(1, response.getNearbyLocations().size(), "Should have one nearby location");
        assertFalse(response.getDisposalGuidelines().isEmpty(), "Disposal guidelines should not be empty");
        assertEquals("Rinse and recycle", response.getDisposalGuidelines().get(0).getInstructions(), "Instructions should match");
        assertFalse(response.getRecyclingTips().isEmpty(), "Recycling tips should not be empty");
    }

    @Test
    void analyzeImage_WithoutLocation_ReturnsResponseWithoutLocations() throws IOException {
        // Arrange - set up minimal tag results
        TagsResult mockTagResult = mock(TagsResult.class);
        DetectedTag mockTag = mock(DetectedTag.class);
        when(mockTag.getName()).thenReturn("paper");
        when(mockTag.getConfidence()).thenReturn(0.75);
        when(mockTagResult.getValues()).thenReturn(Collections.singletonList(mockTag));
        when(mockAnalysisResult.getTags()).thenReturn(mockTagResult);
        when(mockAnalysisResult.getObjects()).thenReturn(null);
        
        // Mock material mapping
        when(materialMappingService.mapObjectToMaterial(anyList())).thenReturn("paper");
        when(materialMappingService.isRecyclable("paper")).thenReturn(true);
        when(materialMappingService.getWasteCategoryForMaterial("paper")).thenReturn(mockWasteCategory);
        
        // Mock Azure AI Vision client
        when(imageAnalysisClient.analyze(any(BinaryData.class), anyList(), any())).thenReturn(mockAnalysisResult);

        // Act
        ImageAnalysisResponse response = imageRecognitionService.analyzeImage(mockImageFile, null, null, null);

        // Assert
        assertNotNull(response, "Response should not be null");
        assertNotNull(response.getMaterial().getMaterialType(), "RecognizedMaterial should not be null");
        assertEquals("paper", response.getMaterial().getMaterialType(), "Material name should match");
        assertTrue(response.getNearbyLocations().isEmpty(), "Nearby locations should be empty when no coordinates provided");
    }

    @Test
    void analyzeImage_WithNoMatchingLocations_ReturnsEmptyLocationsList() throws IOException {
        // Arrange
        Double latitude = 34.0522;
        Double longitude = -118.2437;
        Integer radius = 10;
        
        // Mock tag results
        TagsResult mockTagResult = mock(TagsResult.class);
        DetectedTag mockTag = mock(DetectedTag.class);
        when(mockTag.getName()).thenReturn("electronic");
        when(mockTag.getConfidence()).thenReturn(0.85);
        when(mockTagResult.getValues()).thenReturn(Collections.singletonList(mockTag));
        when(mockAnalysisResult.getTags()).thenReturn(mockTagResult);
        when(mockAnalysisResult.getObjects()).thenReturn(null);
        
        // Mock material mapping
        WasteCategory electronicCategory = new WasteCategory();
        electronicCategory.setId(2L);
        electronicCategory.setName("Electronic");
        electronicCategory.setDisposalGuidelines(Collections.singletonList(mockGuideline));
        electronicCategory.setRecyclingTips(Collections.emptyList());
        
        when(materialMappingService.mapObjectToMaterial(anyList())).thenReturn("electronic");
        when(materialMappingService.isRecyclable("electronic")).thenReturn(true);
        when(materialMappingService.getWasteCategoryForMaterial("electronic")).thenReturn(electronicCategory);
        
        // Mock Azure AI Vision client
        when(imageAnalysisClient.analyze(any(BinaryData.class), anyList(), any())).thenReturn(mockAnalysisResult);
        
        // Mock location service to return locations that DON'T match the waste category
        RecyclingLocationDTO mockLocationDTO = new RecyclingLocationDTO();
        mockLocationDTO.setId(1L);
        mockLocationDTO.setName("Paper Recycling Only");
        Map<String, Boolean> acceptedMaterials = new HashMap<>();
        acceptedMaterials.put("paper", true);
        acceptedMaterials.put("plastic", false);
        acceptedMaterials.put("ewaste", false);
        mockLocationDTO.setAcceptedMaterials(acceptedMaterials);
        
        when(recyclingLocationService.findNearbyLocations(latitude, longitude, radius.doubleValue()))
            .thenReturn(Collections.singletonList(mockLocationDTO));

        // Act
        ImageAnalysisResponse response = imageRecognitionService.analyzeImage(mockImageFile, latitude, longitude, radius);

        // Assert
        assertNotNull(response, "Response should not be null");
        assertTrue(response.getNearbyLocations().isEmpty(), "Nearby locations should be empty when no matching locations found");
    }

    @Test
    void analyzeImage_IOException_ThrowsIOException() throws IOException {
        // Arrange
        MultipartFile errorFile = mock(MultipartFile.class);
        when(errorFile.getBytes()).thenThrow(new IOException("File read error"));

        // Act & Assert
        assertThrows(IOException.class, () -> 
            imageRecognitionService.analyzeImage(errorFile, 34.0522, -118.2437, 10),
            "Should throw IOException when file cannot be read");
    }
}
