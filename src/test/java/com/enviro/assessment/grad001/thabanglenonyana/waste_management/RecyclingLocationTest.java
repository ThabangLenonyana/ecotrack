package com.enviro.assessment.grad001.thabanglenonyana.waste_management;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.exception.ResourceNotFoundException;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility.RecyclingLocationController;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility.RecyclingLocationDTO;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility.RecyclingLocationService;

@ExtendWith(MockitoExtension.class)
public class RecyclingLocationTest {

    @Mock
    private RecyclingLocationService locationService;

    @InjectMocks
    private RecyclingLocationController locationController;

    private RecyclingLocationDTO testLocationDTO;
    private List<RecyclingLocationDTO> locationList;

    @BeforeEach
    void setUp() {
        // Create a test location DTO
        testLocationDTO = new RecyclingLocationDTO();
        testLocationDTO.setId(1L);
        testLocationDTO.setName("Test Recycling Center");
        testLocationDTO.setLatitude(-26.2041);
        testLocationDTO.setLongitude(28.0473);
        testLocationDTO.setType("DROP-OFF");
        testLocationDTO.setMunicipality("Johannesburg");
        testLocationDTO.setCity("Sandton");
        
        // Set accepted materials
        Map<String, Boolean> materials = new HashMap<>();
        materials.put("plastic", true);
        materials.put("paper", true);
        materials.put("cardboard", false);
        materials.put("metal", true);
        materials.put("ewaste", false);
        materials.put("cans", true);
        materials.put("motorOil", false);
        materials.put("cartons", true);
        testLocationDTO.setAcceptedMaterials(materials);
        
        // Create a list of locations
        locationList = Arrays.asList(testLocationDTO);
    }

    @Test
    void getAllLocations_Success() {
        // Arrange
        Page<RecyclingLocationDTO> locationPage = new PageImpl<>(locationList);
        when(locationService.getAllLocations(any(Pageable.class))).thenReturn(locationPage);

        // Act
        ResponseEntity<Page<RecyclingLocationDTO>> response = locationController.getAllLocations(0, 20, "name");

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(locationPage, response.getBody());
        verify(locationService).getAllLocations(any(Pageable.class));
    }

    @Test
    void getLocationById_ExistingLocation() {
        // Arrange
        when(locationService.getLocationById(1L)).thenReturn(testLocationDTO);

        // Act
        ResponseEntity<RecyclingLocationDTO> response = locationController.getLocationById(1L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testLocationDTO, response.getBody());
        verify(locationService).getLocationById(1L);
    }

    @Test
    void getLocationById_NotFound() {
        // Arrange
        when(locationService.getLocationById(999L)).thenThrow(new ResourceNotFoundException("Location not found"));

        // Act
        ResponseEntity<RecyclingLocationDTO> response = locationController.getLocationById(999L);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(locationService).getLocationById(999L);
    }

    @Test
    void getLocationsByType_Success() {
        // Arrange
        when(locationService.getLocationsByType("DROP-OFF")).thenReturn(locationList);

        // Act
        ResponseEntity<List<RecyclingLocationDTO>> response = locationController.getLocationsByType("DROP-OFF");

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(locationList, response.getBody());
        verify(locationService).getLocationsByType("DROP-OFF");
    }

    @Test
    void findNearbyLocations_Success() {
        // Arrange
        double testLatitude = -26.2041;
        double testLongitude = 28.0473;
        double testRadius = 10.0;
        
        when(locationService.findNearbyLocations(testLatitude, testLongitude, testRadius))
            .thenReturn(locationList);

        // Act
        ResponseEntity<List<RecyclingLocationDTO>> response = 
            locationController.findNearbyLocations(testLatitude, testLongitude, testRadius);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(locationList, response.getBody());
        verify(locationService).findNearbyLocations(testLatitude, testLongitude, testRadius);
    }

    @Test
    void findLocationsByMaterials_Success() {
        // Arrange
        when(locationService.findLocationsByMaterials(
                true, false, true, false, true, false))
            .thenReturn(locationList);

        // Act
        ResponseEntity<List<RecyclingLocationDTO>> response = 
            locationController.findLocationsByMaterials(true, false, true, false, true, false);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(locationList, response.getBody());
        verify(locationService).findLocationsByMaterials(
                true, false, true, false, true, false);
    }
    
    @Test
    void getAllLocationsForMap_Success() {
        // Arrange
        when(locationService.getAllLocationsForMap()).thenReturn(locationList);

        // Act
        ResponseEntity<List<RecyclingLocationDTO>> response = locationController.getAllLocationsForMap();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(locationList, response.getBody());
        verify(locationService).getAllLocationsForMap();
    }
}
