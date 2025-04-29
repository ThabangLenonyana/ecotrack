package com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.exception.ResourceNotFoundException;

/**
 * Controller for managing recycling locations
 * Provides REST endpoints for retrieving location data
 */
@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
@Tag(name = "Recycling Locations", description = "Recycling location management APIs")
public class RecyclingLocationController {
    
    private final RecyclingLocationService locationService;
    
    /**
     * Get all recycling locations with pagination
     * 
     * @param page page number (0-based)
     * @param size page size
     * @param sort sort field
     * @return paginated list of recycling locations
     */
    @Operation(
        summary = "Get all recycling locations",
        description = "Retrieves a paginated list of all recycling locations"
    )
    @ApiResponse(responseCode = "200", description = "Locations found successfully")
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Page<RecyclingLocationDTO>> getAllLocations(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "name") String sort) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(sort));
        Page<RecyclingLocationDTO> locations = locationService.getAllLocations(pageable);
        return ResponseEntity.ok(locations);
    }
    
    /**
     * Get a recycling location by its ID
     * 
     * @param id location ID
     * @return the recycling location
     */
    @Operation(
        summary = "Get recycling location by ID",
        description = "Retrieves a specific recycling location using its ID"
    )
    @ApiResponse(responseCode = "200", description = "Location found")
    @ApiResponse(responseCode = "404", description = "Location not found")
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<RecyclingLocationDTO> getLocationById(
            @Parameter(description = "Location ID") @PathVariable Long id) {
        
        try {
            RecyclingLocationDTO location = locationService.getLocationById(id);
            return ResponseEntity.ok(location);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get recycling locations by type
     * 
     * @param type location type
     * @return list of recycling locations
     */
    @Operation(
        summary = "Get recycling locations by type",
        description = "Retrieves recycling locations filtered by type"
    )
    @ApiResponse(responseCode = "200", description = "Locations found")
    @GetMapping("/by-type/{type}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<RecyclingLocationDTO>> getLocationsByType(
            @Parameter(description = "Location type") @PathVariable String type) {
        
        List<RecyclingLocationDTO> locations = locationService.getLocationsByType(type);
        return ResponseEntity.ok(locations);
    }
    
    /**
     * Find nearby recycling locations
     * 
     * @param latitude user's latitude
     * @param longitude user's longitude
     * @param radius search radius in kilometers
     * @return list of nearby recycling locations
     */
    @Operation(
        summary = "Find nearby recycling locations",
        description = "Finds recycling locations within a specified radius from given coordinates"
    )
    @ApiResponse(responseCode = "200", description = "Locations found")
    @GetMapping("/nearby")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<RecyclingLocationDTO>> findNearbyLocations(
            @Parameter(description = "Latitude") @RequestParam double latitude,
            @Parameter(description = "Longitude") @RequestParam double longitude,
            @Parameter(description = "Radius in kilometers") @RequestParam(defaultValue = "10") double radius) {
        
        List<RecyclingLocationDTO> locations = locationService.findNearbyLocations(latitude, longitude, radius);
        return ResponseEntity.ok(locations);
    }
    
    /**
     * Find recycling locations by accepted materials
     * 
     * @param plastic filter for plastic acceptance
     * @param paper filter for paper acceptance
     * @param cardboard filter for cardboard acceptance
     * @param metal filter for metal acceptance
     * @param ewaste filter for e-waste acceptance
     * @param cartons filter for cartons acceptance
     * @return list of filtered recycling locations
     */
    @Operation(
        summary = "Find recycling locations by accepted materials",
        description = "Filters recycling locations by the materials they accept"
    )
    @ApiResponse(responseCode = "200", description = "Locations found")
    @GetMapping("/by-materials")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<RecyclingLocationDTO>> findLocationsByMaterials(
            @Parameter(description = "Accepts plastic") @RequestParam(defaultValue = "false") boolean plastic,
            @Parameter(description = "Accepts paper") @RequestParam(defaultValue = "false") boolean paper,
            @Parameter(description = "Accepts cardboard") @RequestParam(defaultValue = "false") boolean cardboard,
            @Parameter(description = "Accepts metal") @RequestParam(defaultValue = "false") boolean metal,
            @Parameter(description = "Accepts e-waste") @RequestParam(defaultValue = "false") boolean ewaste,
            @Parameter(description = "Accepts cartons") @RequestParam(defaultValue = "false") boolean cartons) {
        
        List<RecyclingLocationDTO> locations = locationService.findLocationsByMaterials(
                plastic, paper, cardboard, metal, ewaste, cartons);
        return ResponseEntity.ok(locations);
    }
    
    /**
     * Get all recycling locations for map display
     * 
     * @return list of all recycling locations with minimal data for map markers
     */
    @Operation(
        summary = "Get all recycling locations for map display",
        description = "Retrieves all recycling locations with minimal data needed for displaying map markers"
    )
    @ApiResponse(responseCode = "200", description = "Locations found successfully")
    @GetMapping("/map-data")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<RecyclingLocationDTO>> getAllLocationsForMap() {
        List<RecyclingLocationDTO> locations = locationService.getAllLocationsForMap();
        return ResponseEntity.ok(locations);
    }
}
