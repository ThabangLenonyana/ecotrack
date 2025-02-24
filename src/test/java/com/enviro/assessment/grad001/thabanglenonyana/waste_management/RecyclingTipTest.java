package com.enviro.assessment.grad001.thabanglenonyana.waste_management;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import jakarta.validation.ConstraintViolationException;

import java.util.Arrays;
import java.util.Collections;
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
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip.DifficultyLevel;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip.RecyclingTipController;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip.RecyclingTipDTO;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip.RecyclingTipService;





@ExtendWith(MockitoExtension.class)
public class RecyclingTipTest {

    @Mock
    private RecyclingTipService tipService;

    @InjectMocks
    private RecyclingTipController tipController;

    private RecyclingTipDTO testTipDTO;

    @BeforeEach
    void setUp() {
        testTipDTO = new RecyclingTipDTO();
        testTipDTO.setTitle("Paper Recycling");
        testTipDTO.setSteps(Arrays.asList(
            "Collect paper",
            "Sort by type",
            "Bundle together"
        ));
        testTipDTO.setDifficulty(DifficultyLevel.EASY);
        testTipDTO.setTimeRequired("30 minutes");
    }

    @Test
    void getAllRecyclingTips_Success() {
        // Arrange
        List<RecyclingTipDTO> tips = Arrays.asList(testTipDTO);
        when(tipService.getAllTips()).thenReturn(tips);

        // Act
        ResponseEntity<List<RecyclingTipDTO>> response = tipController.getAllRecyclingTips();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(tips, response.getBody());
        verify(tipService).getAllTips();
    }

    @Test
    void getAllRecyclingTips_ServerError() {
        // Arrange
        when(tipService.getAllTips()).thenThrow(new RuntimeException());

        // Act
        ResponseEntity<List<RecyclingTipDTO>> response = tipController.getAllRecyclingTips();

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        verify(tipService).getAllTips();
    }

    @Test
    void findById_ExistingTip() {
        // Arrange
        when(tipService.getTipById(1L)).thenReturn(testTipDTO);

        // Act
        ResponseEntity<RecyclingTipDTO> response = tipController.findById(1L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testTipDTO, response.getBody());
        verify(tipService).getTipById(1L);
    }

    @Test
    void findById_NonExistingTip() {
        // Arrange
        when(tipService.getTipById(99L))
            .thenThrow(new ResourceNotFoundException("Tip not found"));

        // Act
        ResponseEntity<RecyclingTipDTO> response = tipController.findById(99L);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(tipService).getTipById(99L);
    }

    @Test
    void create_Success() {
        // Arrange
        when(tipService.createTip(any(RecyclingTipDTO.class))).thenReturn(testTipDTO);

        // Act
        ResponseEntity<RecyclingTipDTO> response = tipController.create(testTipDTO);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(testTipDTO, response.getBody());
        verify(tipService).createTip(testTipDTO);
    }

    @Test
    void create_DuplicateTitle() {
        // Arrange
        when(tipService.createTip(any(RecyclingTipDTO.class)))
            .thenThrow(new DuplicateResourceException("Title already exists"));

        // Act
        ResponseEntity<RecyclingTipDTO> response = tipController.create(testTipDTO);

        // Assert
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        verify(tipService).createTip(testTipDTO);
    }

    @Test
    void create_ValidationError() {
        // Arrange
        when(tipService.createTip(any(RecyclingTipDTO.class)))
            .thenThrow(new ConstraintViolationException("Invalid data", null));

        // Act
        ResponseEntity<RecyclingTipDTO> response = tipController.create(testTipDTO);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(tipService).createTip(testTipDTO);
    }

    @Test
    void update_Success() {
        // Arrange
        when(tipService.updateTip(eq(1L), any(RecyclingTipDTO.class))).thenReturn(testTipDTO);

        // Act
        ResponseEntity<RecyclingTipDTO> response = tipController.update(1L, testTipDTO);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testTipDTO, response.getBody());
        verify(tipService).updateTip(1L, testTipDTO);
    }

    @Test
    void update_NotFound() {
        // Arrange
        when(tipService.updateTip(eq(99L), any(RecyclingTipDTO.class)))
            .thenThrow(new ResourceNotFoundException("Tip not found"));

        // Act
        ResponseEntity<RecyclingTipDTO> response = tipController.update(99L, testTipDTO);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(tipService).updateTip(99L, testTipDTO);
    }

    @Test
    void delete_Success() {
        // Arrange
        doNothing().when(tipService).deleteTip(1L);

        // Act
        ResponseEntity<Void> response = tipController.delete(1L);

        // Assert
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(tipService).deleteTip(1L);
    }

    @Test
    void delete_NotFound() {
        // Arrange
        doThrow(new ResourceNotFoundException("Tip not found"))
            .when(tipService).deleteTip(99L);

        // Act
        ResponseEntity<Void> response = tipController.delete(99L);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(tipService).deleteTip(99L);
    }

    @Test
    void assignToCategory_Success() {
        // Arrange
        when(tipService.assignToCategory(1L, 2L)).thenReturn(testTipDTO);

        // Act
        ResponseEntity<RecyclingTipDTO> response = tipController.assignToCategory(1L, 2L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testTipDTO, response.getBody());
        verify(tipService).assignToCategory(1L, 2L);
    }

    @Test
    void assignToCategory_NotFound() {
        // Arrange
        when(tipService.assignToCategory(99L, 1L))
            .thenThrow(new ResourceNotFoundException("Tip or category not found"));

        // Act
        ResponseEntity<RecyclingTipDTO> response = tipController.assignToCategory(99L, 1L);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(tipService).assignToCategory(99L, 1L);
    }

    @Test
    void assignToCategory_IllegalOperation() {
        // Arrange
        when(tipService.assignToCategory(1L, 1L))
            .thenThrow(new IllegalOperationException("Already assigned"));

        // Act
        ResponseEntity<RecyclingTipDTO> response = tipController.assignToCategory(1L, 1L);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(tipService).assignToCategory(1L, 1L);
    }

    @Test
    void unassignTip_Success() {
        // Arrange
        when(tipService.unassignTip(1L)).thenReturn(testTipDTO);

        // Act
        ResponseEntity<RecyclingTipDTO> response = tipController.unassignTip(1L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testTipDTO, response.getBody());
        verify(tipService).unassignTip(1L);
    }

    @Test
    void unassignTip_NotFound() {
        // Arrange
        when(tipService.unassignTip(99L))
            .thenThrow(new ResourceNotFoundException("Tip not found"));

        // Act
        ResponseEntity<RecyclingTipDTO> response = tipController.unassignTip(99L);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(tipService).unassignTip(99L);
    }

    @Test
    void create_InvalidSteps() {
        // Arrange
        testTipDTO.setSteps(Collections.emptyList());  // Invalid empty steps
        when(tipService.createTip(any(RecyclingTipDTO.class)))
            .thenThrow(new ConstraintViolationException("Steps cannot be empty", null));

        // Act
        ResponseEntity<RecyclingTipDTO> response = tipController.create(testTipDTO);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void create_InvalidTimeRequired() {
        testTipDTO.setTimeRequired("");
        when(tipService.createTip(any(RecyclingTipDTO.class)))
            .thenThrow(new ConstraintViolationException("Time required cannot be empty", null));

        ResponseEntity<RecyclingTipDTO> response = tipController.create(testTipDTO);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void update_DuplicateTitle() {
        when(tipService.updateTip(eq(1L), any(RecyclingTipDTO.class)))
            .thenThrow(new DuplicateResourceException("Title already exists"));

        ResponseEntity<RecyclingTipDTO> response = tipController.update(1L, testTipDTO);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
    }
}