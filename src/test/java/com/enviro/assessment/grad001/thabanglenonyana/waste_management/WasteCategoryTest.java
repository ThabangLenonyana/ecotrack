package com.enviro.assessment.grad001.thabanglenonyana.waste_management;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
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

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.category.WasteCategoryController;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.category.WasteCategoryDTO;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.category.WasteCategoryService;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.exception.ResourceNotFoundException;

@ExtendWith(MockitoExtension.class)
public class WasteCategoryTest {

    @Mock
    private WasteCategoryService wasteCategoryService;

    @InjectMocks
    private WasteCategoryController wasteCategoryController;

    private WasteCategoryDTO testCategoryDTO;

    @BeforeEach
    void setUp() {
        // Setup test category DTO
        testCategoryDTO = new WasteCategoryDTO();
        testCategoryDTO.setName("Paper");
        testCategoryDTO.setDescription("Paper waste materials");
        testCategoryDTO.setDisposalGuidelines(new ArrayList<>());
        testCategoryDTO.setRecyclingTips(new ArrayList<>());
    }

    @Test
    void testGetAllCategories() {
        // Arrange
        List<WasteCategoryDTO> categoryDTOs = Arrays.asList(testCategoryDTO);
        when(wasteCategoryService.getAllCategories()).thenReturn(categoryDTOs);

        // Act
        ResponseEntity<List<WasteCategoryDTO>> response = wasteCategoryController.getAllCategories();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals(testCategoryDTO.getName(), response.getBody().get(0).getName());
        verify(wasteCategoryService).getAllCategories();
    }

    @Test
    void testGetCategoryById_ExistingCategory() {
        // Arrange
        when(wasteCategoryService.getCategoryById(1L)).thenReturn(testCategoryDTO);

        // Act
        ResponseEntity<WasteCategoryDTO> response = wasteCategoryController.getCategoryById(1L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testCategoryDTO.getName(), response.getBody().getName());
        verify(wasteCategoryService).getCategoryById(1L);
    }

    @Test
    void testGetCategoryById_NonExistingCategory() {
        // Arrange
        when(wasteCategoryService.getCategoryById(99L))
            .thenThrow(new ResourceNotFoundException("Category not found with id: 99"));

        // Act
        ResponseEntity<WasteCategoryDTO> response = wasteCategoryController.getCategoryById(99L);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(wasteCategoryService).getCategoryById(99L);
    }

    @Test
    void testCreateCategory_ValidData() {
        // Arrange
        when(wasteCategoryService.createCategory(any(WasteCategoryDTO.class)))
            .thenReturn(testCategoryDTO);

        // Act
        ResponseEntity<WasteCategoryDTO> response = wasteCategoryController.createCategory(testCategoryDTO);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(testCategoryDTO.getName(), response.getBody().getName());
        verify(wasteCategoryService).createCategory(any(WasteCategoryDTO.class));
    }

    @Test
    void testUpdateCategory_ExistingCategory() {
        // Arrange
        when(wasteCategoryService.updateCategory(eq(1L), any(WasteCategoryDTO.class)))
            .thenReturn(testCategoryDTO);

        // Act
        ResponseEntity<WasteCategoryDTO> response = 
            wasteCategoryController.updateCategory(1L, testCategoryDTO);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testCategoryDTO.getName(), response.getBody().getName());
        verify(wasteCategoryService).updateCategory(eq(1L), any(WasteCategoryDTO.class));
    }

    @Test
    void testUpdateCategory_NonExistingCategory() {
        // Arrange
        when(wasteCategoryService.updateCategory(eq(99L), any(WasteCategoryDTO.class)))
            .thenThrow(new ResourceNotFoundException("Category not found with id: 99"));

        // Act
        ResponseEntity<WasteCategoryDTO> response = 
            wasteCategoryController.updateCategory(99L, testCategoryDTO);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(wasteCategoryService).updateCategory(eq(99L), any(WasteCategoryDTO.class));
    }

    @Test
    void testDeleteCategory_ExistingCategory() {
        // Arrange
        doNothing().when(wasteCategoryService).deleteCategory(1L);

        // Act
        ResponseEntity<Void> response = wasteCategoryController.deleteCategory(1L);

        // Assert
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(wasteCategoryService).deleteCategory(1L);
    }

    @Test
    void testDeleteCategory_NonExistingCategory() {
        // Arrange
        doThrow(new ResourceNotFoundException("Category not found with id: 99"))
            .when(wasteCategoryService).deleteCategory(99L);

        // Act
        ResponseEntity<Void> response = wasteCategoryController.deleteCategory(99L);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(wasteCategoryService).deleteCategory(99L);
    }

    @Test
    void testCreateCategory_InvalidData() {
        // Arrange
        WasteCategoryDTO invalidDTO = new WasteCategoryDTO();
        when(wasteCategoryService.createCategory(any(WasteCategoryDTO.class)))
            .thenThrow(new ConstraintViolationException("Invalid data", null));

        // Act
        ResponseEntity<WasteCategoryDTO> response = wasteCategoryController.createCategory(invalidDTO);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(wasteCategoryService).createCategory(any(WasteCategoryDTO.class));
    }

    @Test
    void testGetAllCategories_EmptyList() {
        // Arrange
        when(wasteCategoryService.getAllCategories()).thenReturn(new ArrayList<>());

        // Act
        ResponseEntity<List<WasteCategoryDTO>> response = wasteCategoryController.getAllCategories();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(0, response.getBody().size());
        verify(wasteCategoryService).getAllCategories();
    }

    @Test
    void testGetAllCategories_ServiceException() {
        // Arrange
        when(wasteCategoryService.getAllCategories())
            .thenThrow(new RuntimeException("Database error"));

        // Act
        ResponseEntity<List<WasteCategoryDTO>> response = wasteCategoryController.getAllCategories();

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        verify(wasteCategoryService).getAllCategories();
    }

    @Test
    void testUpdateCategory_InvalidData() {
        // Arrange
        WasteCategoryDTO invalidDTO = new WasteCategoryDTO();
        when(wasteCategoryService.updateCategory(eq(1L), any(WasteCategoryDTO.class)))
            .thenThrow(new ConstraintViolationException("Invalid data", null));

        // Act
        ResponseEntity<WasteCategoryDTO> response = 
            wasteCategoryController.updateCategory(1L, invalidDTO);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(wasteCategoryService).updateCategory(eq(1L), any(WasteCategoryDTO.class));
    }

    @Test
    void testCategoryNameValidation() {
        // Arrange
        testCategoryDTO.setName("");  // Invalid empty name
        when(wasteCategoryService.createCategory(any(WasteCategoryDTO.class)))
            .thenThrow(new ConstraintViolationException("Name cannot be empty", null));

        // Act
        ResponseEntity<WasteCategoryDTO> response = wasteCategoryController.createCategory(testCategoryDTO);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(wasteCategoryService).createCategory(any(WasteCategoryDTO.class));
    }

    @Test
    void testCategoryDescriptionValidation() {
        // Arrange
        testCategoryDTO.setDescription(null);  // Invalid null description
        when(wasteCategoryService.createCategory(any(WasteCategoryDTO.class)))
            .thenThrow(new ConstraintViolationException("Description cannot be null", null));

        // Act
        ResponseEntity<WasteCategoryDTO> response = wasteCategoryController.createCategory(testCategoryDTO);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(wasteCategoryService).createCategory(any(WasteCategoryDTO.class));
    }

    @Test
    void testUpdateCategory_ServiceException() {
        // Arrange
        when(wasteCategoryService.updateCategory(eq(1L), any(WasteCategoryDTO.class)))
            .thenThrow(new RuntimeException("Database error"));

        // Act
        ResponseEntity<WasteCategoryDTO> response = 
            wasteCategoryController.updateCategory(1L, testCategoryDTO);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(wasteCategoryService).updateCategory(eq(1L), any(WasteCategoryDTO.class));
    }

    @Test
    void testDeleteCategory_ServiceException() {
        // Arrange
        RuntimeException exception = new RuntimeException("Database error");
        doThrow(exception)
            .when(wasteCategoryService).deleteCategory(1L);

        // Act
        ResponseEntity<Void> response = wasteCategoryController.deleteCategory(1L);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        verify(wasteCategoryService).deleteCategory(1L);
        
    }
}