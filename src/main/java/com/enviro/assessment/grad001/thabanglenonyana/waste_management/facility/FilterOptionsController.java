package com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for providing filter options for recycling locations
 * Provides REST endpoints for retrieving distinct filter values
 */
@RestController
@RequestMapping("/api/locations/filter-options")
@RequiredArgsConstructor
@Tag(name = "Filter Options", description = "Filter options for recycling locations")
public class FilterOptionsController {
    
    private final RecyclingLocationService locationService;
    
    /**
     * Get all filter options in a single request
     * 
     * @return all filter options (cities, facility types, materials)
     */
    @Operation(
        summary = "Get all filter options",
        description = "Retrieves all available filter options for recycling locations"
    )
    @ApiResponse(responseCode = "200", description = "Filter options retrieved successfully")
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Map<String, List<Map<String, Object>>>> getAllFilterOptions() {
        return ResponseEntity.ok(locationService.getAllFilterOptions());
    }
    
    /**
     * Get distinct cities
     * 
     * @return list of distinct cities
     */
    @Operation(
        summary = "Get city filter options",
        description = "Retrieves all distinct cities that have recycling locations"
    )
    @ApiResponse(responseCode = "200", description = "Cities retrieved successfully")
    @GetMapping("/cities")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<Map<String, Object>>> getDistinctCities() {
        return ResponseEntity.ok(locationService.getDistinctCities());
    }
    
    /**
     * Get distinct facility types
     * 
     * @return list of distinct facility types
     */
    @Operation(
        summary = "Get facility type filter options",
        description = "Retrieves all distinct facility types available"
    )
    @ApiResponse(responseCode = "200", description = "Facility types retrieved successfully")
    @GetMapping("/facility-types")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<Map<String, Object>>> getDistinctFacilityTypes() {
        return ResponseEntity.ok(locationService.getDistinctFacilityTypes());
    }
    
    /**
     * Get distinct materials
     * 
     * @return list of distinct materials
     */
    @Operation(
        summary = "Get material filter options",
        description = "Retrieves all distinct materials accepted by recycling locations"
    )
    @ApiResponse(responseCode = "200", description = "Materials retrieved successfully")
    @GetMapping("/materials")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<Map<String, Object>>> getDistinctMaterials() {
        return ResponseEntity.ok(locationService.getDistinctMaterials());
    }
}