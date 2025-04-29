package com.enviro.assessment.grad001.thabanglenonyana.waste_management;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.exception.ResourceNotFoundException;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility.RecyclingLocation;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility.RecyclingLocationDTO;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility.RecyclingLocationMapper;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility.RecyclingLocationRepository;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility.RecyclingLocationService;

@ExtendWith(MockitoExtension.class)
public class RecyclingLocationServiceTest {

    @Mock
    private RecyclingLocationRepository locationRepository;

    @Mock
    private RecyclingLocationMapper locationMapper;

    @InjectMocks
    private RecyclingLocationService locationService;

    private RecyclingLocation testLocation;
    private RecyclingLocationDTO testLocationDTO;
    private List<RecyclingLocation> locationList;

    @BeforeEach
    void setUp() {
        // Create a test location entity
        testLocation = new RecyclingLocation();
        testLocation.setId(1L);
        testLocation.setName("Test Recycling Center");
        testLocation.setLatitude(-26.2041);
        testLocation.setLongitude(28.0473);
        testLocation.setType("DROP-OFF");
        testLocation.setMunicipality("Johannesburg");
        testLocation.setCity("Sandton");
        testLocation.setAcceptsPlastic(true);
        testLocation.setAcceptsPaper(true);
        testLocation.setAcceptsCardboard(false);
        testLocation.setAcceptsMetal(true);
        testLocation.setAcceptsEWaste(false);
        testLocation.setAcceptsCans(true);
        testLocation.setAcceptsMotorOil(false);
        testLocation.setAcceptsCartons(true);
        
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
        
        // Create lists of locations and DTOs
        locationList = Arrays.asList(testLocation);
    }

    @Test
    void getAllLocations_Success() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 20, Sort.by("name"));
        Page<RecyclingLocation> locationPage = new PageImpl<>(locationList);
        when(locationRepository.findAll(pageable)).thenReturn(locationPage);
        when(locationMapper.toDto(testLocation)).thenReturn(testLocationDTO);

        // Act
        Page<RecyclingLocationDTO> result = locationService.getAllLocations(pageable);

        // Assert
        assertEquals(1, result.getTotalElements());
        verify(locationRepository).findAll(pageable);
        verify(locationMapper).toDto(testLocation);
    }
    
    @Test
    void getLocationById_ExistingLocation() {
        // Arrange
        when(locationRepository.findById(1L)).thenReturn(Optional.of(testLocation));
        when(locationMapper.toDto(testLocation)).thenReturn(testLocationDTO);
        
        // Act
        RecyclingLocationDTO result = locationService.getLocationById(1L);
        
        // Assert
        assertEquals(testLocationDTO, result);
        verify(locationRepository).findById(1L);
        verify(locationMapper).toDto(testLocation);
    }
    
    @Test
    void getLocationById_NotFound() {
        // Arrange
        when(locationRepository.findById(999L)).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            locationService.getLocationById(999L);
        });
        verify(locationRepository).findById(999L);
    }
    
    @Test
    void getLocationsByType_Success() {
        // Arrange
        when(locationRepository.findByType("DROP-OFF")).thenReturn(locationList);
        when(locationMapper.toDto(testLocation)).thenReturn(testLocationDTO);
        
        // Act
        List<RecyclingLocationDTO> result = locationService.getLocationsByType("DROP-OFF");
        
        // Assert
        assertEquals(1, result.size());
        assertEquals(testLocationDTO, result.get(0));
        verify(locationRepository).findByType("DROP-OFF");
        verify(locationMapper).toDto(testLocation);
    }
    
    @Test
    void findNearbyLocations_Success() {
        // Arrange
        double testLatitude = -26.2041;
        double testLongitude = 28.0473;
        double testRadius = 10.0;
        
        when(locationRepository.findNearbyLocations(testLatitude, testLongitude, testRadius))
            .thenReturn(locationList);
        when(locationMapper.toDto(testLocation)).thenReturn(testLocationDTO);
        
        // Act
        List<RecyclingLocationDTO> result = locationService.findNearbyLocations(
                testLatitude, testLongitude, testRadius);
        
        // Assert
        assertEquals(1, result.size());
        verify(locationRepository).findNearbyLocations(testLatitude, testLongitude, testRadius);
        verify(locationMapper).toDto(testLocation);
        
        // Verify distance calculation was done
        assertNotNull(result.get(0).getDistance());
    }
    
    @Test
    void findLocationsByMaterials_Success() {
        // Arrange
        when(locationRepository.findByAcceptedMaterials(
                true, false, true, false, true, false))
            .thenReturn(locationList);
        when(locationMapper.toDto(testLocation)).thenReturn(testLocationDTO);
        
        // Act
        List<RecyclingLocationDTO> result = locationService.findLocationsByMaterials(
                true, false, true, false, true, false);
        
        // Assert
        assertEquals(1, result.size());
        assertEquals(testLocationDTO, result.get(0));
        verify(locationMapper).toDto(testLocation);
        verify(locationRepository).findByAcceptedMaterials(
                true, false, true, false, true, false);
    }
    
    @Test
    void getAllLocationsForMap_Success() {
        // Arrange
        when(locationRepository.findAll()).thenReturn(locationList);
        when(locationMapper.toDto(testLocation)).thenReturn(testLocationDTO);
        
        // Act
        List<RecyclingLocationDTO> result = locationService.getAllLocationsForMap();
        
        // Assert
        assertEquals(1, result.size());
        assertEquals(testLocationDTO, result.get(0));
        verify(locationRepository).findAll();
        verify(locationMapper).toDto(testLocation);
    }
}
