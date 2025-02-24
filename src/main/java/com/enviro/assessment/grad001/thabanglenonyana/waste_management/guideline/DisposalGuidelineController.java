package com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.exception.DuplicateResourceException;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.exception.IllegalOperationException;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.exception.ResourceNotFoundException;

/**
 * This class is a controller class that will be used to handle HTTP requests for the DisposalGuideline entity.
 */
@RestController
@RequestMapping("/api/guidelines")
@RequiredArgsConstructor
@Tag(name = "Disposal Guidelines", description = "Disposal guideline management APIs")
public class DisposalGuidelineController {
    
    // Inject the DisposalGuidelineService
    private final DisposalGuidelineService guidelineService;

    // Get all guidelines
    @Operation(
        summary = "Get all disposal guidelines",
        description = "Retrieves a list of all disposal guidelines"
    )
    @ApiResponse(responseCode = "200", description = "Guidelines found successfully")
    @ApiResponse(responseCode = "500", description = "Internal server error")
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<DisposalGuidelineDTO>> getAllGuidelines() {
        try {
        List<DisposalGuidelineDTO> guidelines = guidelineService.getAllGuidelines();
        return ResponseEntity.ok(guidelines);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get guideline by ID
    @Operation(
        summary = "Get disposal guideline by ID",
        description = "Retrieves a specific disposal guideline using its ID"
    )
    @ApiResponse(responseCode = "200", description = "Guideline found")
    @ApiResponse(responseCode = "404", description = "Guideline not found")
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<DisposalGuidelineDTO> getGuidelineById(@PathVariable Long id) {
        try {
            DisposalGuidelineDTO guideline = guidelineService.getGuidelineById(id);
            return ResponseEntity.ok(guideline);
        } 
         catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Create guideline 
    @Operation(
        summary = "Create new disposal guideline",
        description = "Creates a new disposal guideline"
    )
    @ApiResponse(responseCode = "201", description = "Guideline created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input")
    @ApiResponse(responseCode = "409", description = "Guideline already exists")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<DisposalGuidelineDTO> createGuideline(@Valid @RequestBody DisposalGuidelineDTO guidelineDTO) {
        try {
            DisposalGuidelineDTO created = guidelineService.createGuideline(guidelineDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } 
        catch (DuplicateResourceException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } 
        catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Assign guideline to category
    @Operation(
        summary = "Assign guideline to category",
        description = "Assigns a disposal guideline to a waste category"
    )
    @ApiResponse(responseCode = "200", description = "Guideline assigned successfully")
    @ApiResponse(responseCode = "404", description = "Guideline or category not found")
    @PatchMapping("/{guidelineId}/assign/{categoryId}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<DisposalGuidelineDTO> assignToCategory(
            @PathVariable Long guidelineId,
            @PathVariable Long categoryId) {
        try {
            DisposalGuidelineDTO updated = guidelineService.assignToCategory(guidelineId, categoryId);
            return ResponseEntity.ok(updated);
        } 
        catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } 
        catch (IllegalOperationException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Unassign guideline from current category
    @PatchMapping("/{guidelineId}/unassign")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<DisposalGuidelineDTO> unassignGuideline(
            @PathVariable Long guidelineId) {
        try {
            DisposalGuidelineDTO updated = guidelineService.unassignGuideline(guidelineId);
            return ResponseEntity.ok(updated);
        } 
        catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Update guideline
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<DisposalGuidelineDTO> updateGuideline(
            @PathVariable Long id,
            @Valid @RequestBody DisposalGuidelineDTO guidelineDTO) {
        try {
            DisposalGuidelineDTO updated = guidelineService.updateGuideline(id, guidelineDTO);
            return ResponseEntity.ok(updated);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete guideline
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteGuideline(@PathVariable Long id) {
        try {
            guidelineService.deleteGuideline(id);
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
