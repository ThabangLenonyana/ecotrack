package com.enviro.assessment.grad001.thabanglenonyana.waste_management;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import jakarta.validation.ConstraintViolationException;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.exception.DuplicateResourceException;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.exception.IllegalOperationException;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.exception.ResourceNotFoundException;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline.DisposalGuidelineController;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline.DisposalGuidelineDTO;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline.DisposalGuidelineService;

@ExtendWith(MockitoExtension.class)
public class DisposalGuidelineTest {

    @Mock
    private DisposalGuidelineService guidelineService;

    @InjectMocks
    private DisposalGuidelineController guidelineController;

    private DisposalGuidelineDTO testGuidelineDTO;

    @BeforeEach
    void setUp() {
        // Setup test guideline DTO
        testGuidelineDTO = new DisposalGuidelineDTO();
        testGuidelineDTO.setTitle("Paper Recycling");
        testGuidelineDTO.setInstructions("Separate clean paper from contaminated materials");
        testGuidelineDTO.setCategoryId(1L);
    }

    @Test
    void testGetAllGuidelines() {
        // Arrange
        List<DisposalGuidelineDTO> guidelineDTOs = Arrays.asList(testGuidelineDTO);
        when(guidelineService.getAllGuidelines()).thenReturn(guidelineDTOs);

        // Act
        ResponseEntity<List<DisposalGuidelineDTO>> response = guidelineController.getAllGuidelines();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals(testGuidelineDTO.getTitle(), response.getBody().get(0).getTitle());
        verify(guidelineService).getAllGuidelines();
    }

    @Test
    void testGetGuidelineById_ExistingGuideline() {
        // Arrange
        when(guidelineService.getGuidelineById(1L)).thenReturn(testGuidelineDTO);

        // Act
        ResponseEntity<DisposalGuidelineDTO> response = guidelineController.getGuidelineById(1L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testGuidelineDTO.getTitle(), response.getBody().getTitle());
        verify(guidelineService).getGuidelineById(1L);
    }

    @Test
    void testCreateGuideline_ValidData() {
        // Arrange
        when(guidelineService.createGuideline(any(DisposalGuidelineDTO.class)))
            .thenReturn(testGuidelineDTO);

        // Act
        ResponseEntity<DisposalGuidelineDTO> response = 
            guidelineController.createGuideline(testGuidelineDTO); // Fixed: removed categoryId parameter

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(testGuidelineDTO.getTitle(), response.getBody().getTitle());
        verify(guidelineService).createGuideline(any(DisposalGuidelineDTO.class));
    }

    @Test
    void testAssignToCategory_Success() {  // Renamed from testAssignGuidelineToCategory_Success
        // Arrange
        when(guidelineService.assignToCategory(1L, 2L)).thenReturn(testGuidelineDTO);

        // Act
        ResponseEntity<DisposalGuidelineDTO> response = 
            guidelineController.assignToCategory(1L, 2L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(guidelineService).assignToCategory(1L, 2L);
    }

    @Test
    void testAssignToCategory_AlreadyAssigned() {  // Renamed from testAssignGuidelineToCategory_AlreadyAssigned
        // Arrange
        when(guidelineService.assignToCategory(1L, 2L))
            .thenThrow(new IllegalOperationException("Guideline already assigned to this category"));

        // Act
        ResponseEntity<DisposalGuidelineDTO> response = 
            guidelineController.assignToCategory(1L, 2L);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(guidelineService).assignToCategory(1L, 2L);
    }

    @Test
    void testUnassignGuideline_Success() {
        // Arrange
        when(guidelineService.unassignGuideline(1L)).thenReturn(testGuidelineDTO);

        // Act
        ResponseEntity<DisposalGuidelineDTO> response = guidelineController.unassignGuideline(1L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(guidelineService).unassignGuideline(1L);
    }

    @Test
    void testUpdateGuideline_Success() {
        // Arrange
        when(guidelineService.updateGuideline(eq(1L), any(DisposalGuidelineDTO.class)))
            .thenReturn(testGuidelineDTO);

        // Act
        ResponseEntity<DisposalGuidelineDTO> response = 
            guidelineController.updateGuideline(1L, testGuidelineDTO);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testGuidelineDTO.getTitle(), response.getBody().getTitle());
        verify(guidelineService).updateGuideline(eq(1L), any(DisposalGuidelineDTO.class));
    }

    @Test
    void testDeleteGuideline_Success() {
        // Arrange
        doNothing().when(guidelineService).deleteGuideline(1L);

        // Act
        ResponseEntity<Void> response = guidelineController.deleteGuideline(1L);

        // Assert
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(guidelineService).deleteGuideline(1L);
    }

    @Test
    void testCreateGuideline_DuplicateTitle() {
        // Arrange
        when(guidelineService.createGuideline(any(DisposalGuidelineDTO.class)))
            .thenThrow(new DuplicateResourceException("Guideline with this title already exists"));

        // Act
        ResponseEntity<DisposalGuidelineDTO> response = 
            guidelineController.createGuideline(testGuidelineDTO);

        // Assert
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        verify(guidelineService).createGuideline(any(DisposalGuidelineDTO.class));
    }

    @Test
    void testGuidelineValidation_InvalidTitle() {
        // Arrange
        testGuidelineDTO.setTitle("");  // Invalid empty title
        when(guidelineService.createGuideline(any(DisposalGuidelineDTO.class)))
            .thenThrow(new ConstraintViolationException("Title cannot be empty", null));

        // Act
        ResponseEntity<DisposalGuidelineDTO> response = 
            guidelineController.createGuideline(testGuidelineDTO);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(guidelineService).createGuideline(any(DisposalGuidelineDTO.class));
    }

    @Test
    void testGetAllGuidelines_EmptyList() {
        // Arrange
        when(guidelineService.getAllGuidelines()).thenReturn(new ArrayList<>());

        // Act
        ResponseEntity<List<DisposalGuidelineDTO>> response = guidelineController.getAllGuidelines();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(0, response.getBody().size());
        verify(guidelineService).getAllGuidelines();
    }

    @Test
    void testUpdateGuideline_NonExistingGuideline() {
        // Arrange
        when(guidelineService.updateGuideline(eq(99L), any(DisposalGuidelineDTO.class)))
            .thenThrow(new ResourceNotFoundException("Guideline not found with id: 99"));

        // Act
        ResponseEntity<DisposalGuidelineDTO> response = 
            guidelineController.updateGuideline(99L, testGuidelineDTO);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(guidelineService).updateGuideline(eq(99L), any(DisposalGuidelineDTO.class));
    }
}