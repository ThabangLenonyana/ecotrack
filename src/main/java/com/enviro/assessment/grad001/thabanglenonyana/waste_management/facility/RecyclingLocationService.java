package com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class RecyclingLocationService {
    
    private final RecyclingLocationRepository locationRepository;
    private final RecyclingLocationMapper locationMapper;
    
    /**
     * Get all recycling locations with pagination
     * 
     * @param pageable pagination information
     * @return page of recycling location DTOs
     */
    public Page<RecyclingLocationDTO> getAllLocations(Pageable pageable) {
        Page<RecyclingLocation> locations = locationRepository.findAll(pageable);
        return locations.map(locationMapper::toDto);
    }
    
    /**
     * Get a recycling location by its ID
     * 
     * @param id the location ID
     * @return the recycling location DTO
     * @throws ResourceNotFoundException if the location with the given ID does not exist
     */
    public RecyclingLocationDTO getLocationById(Long id) {
        RecyclingLocation location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recycling location not found with id: " + id));
        return locationMapper.toDto(location);
    }
    
    /**
     * Get recycling locations by type
     * 
     * @param type the location type
     * @return list of recycling location DTOs
     */
    public List<RecyclingLocationDTO> getLocationsByType(String type) {
        List<RecyclingLocation> locations = locationRepository.findByType(type);
        return locations.stream()
                .map(locationMapper::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Find nearby recycling locations within a specified radius
     * 
     * @param latitude the reference latitude
     * @param longitude the reference longitude
     * @param radius the search radius in kilometers
     * @return list of recycling location DTOs with distance information
     */
    public List<RecyclingLocationDTO> findNearbyLocations(double latitude, double longitude, double radius) {
        List<RecyclingLocation> locations = locationRepository.findNearbyLocations(latitude, longitude, radius);
        List<RecyclingLocationDTO> dtos = locations.stream()
                .map(locationMapper::toDto)
                .collect(Collectors.toList());
        
        // Calculate distance for each location
        dtos.forEach(dto -> dto.calculateDistance(latitude, longitude));
        
        // Sort by distance (closest first)
        return dtos.stream()
                .sorted((a, b) -> Double.compare(a.getDistance(), b.getDistance()))
                .collect(Collectors.toList());
    }
    
    /**
     * Find recycling locations that accept specified materials
     * 
     * @param acceptsPlastic filter for plastic acceptance
     * @param acceptsPaper filter for paper acceptance
     * @param acceptsCardboard filter for cardboard acceptance
     * @param acceptsMetal filter for metal acceptance
     * @param acceptsEWaste filter for e-waste acceptance
     * @param acceptsCartons filter for carton acceptance
     * @return list of recycling location DTOs
     */
    public List<RecyclingLocationDTO> findLocationsByMaterials(
            boolean acceptsPlastic,
            boolean acceptsPaper,
            boolean acceptsCardboard,
            boolean acceptsMetal,
            boolean acceptsEWaste,
            boolean acceptsCartons) {
        
        List<RecyclingLocation> locations = locationRepository.findByAcceptedMaterials(
                acceptsPlastic, acceptsPaper, acceptsCardboard, 
                acceptsMetal, acceptsEWaste, acceptsCartons);
        
        return locations.stream()
                .map(locationMapper::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all recycling locations for map display without pagination
     * Returns all locations with essential data for map markers
     * 
     * @return list of all recycling location DTOs with essential map data
     */
    public List<RecyclingLocationDTO> getAllLocationsForMap() {
        List<RecyclingLocation> locations = locationRepository.findAll();
        return locations.stream()
                .map(locationMapper::toDto)
                .collect(Collectors.toList());
    }
}
