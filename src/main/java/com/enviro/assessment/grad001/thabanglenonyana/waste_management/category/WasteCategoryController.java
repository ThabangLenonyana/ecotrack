package com.enviro.assessment.grad001.thabanglenonyana.waste_management.category;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.exception.DuplicateResourceException;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.exception.ResourceNotFoundException;

/**
 * This class is a controller class that will be used to handle HTTP requests for the WasteCategory entity.
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Waste Categories", description = "Waste category management APIs")
public class WasteCategoryController {

    private static final Logger log = LoggerFactory.getLogger(WasteCategoryController.class);

    // Inject the WasteCategoryService
    private final WasteCategoryService wasteCategoryService;

    // Get all categories
    @Operation(
        summary = "Get all waste categories",
        description = "Retrieves a list of all waste categories in the system"
    )
    @ApiResponse(responseCode = "200", description = "Categories found successfully")
    @ApiResponse(responseCode = "500", description = "Internal server error")
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<WasteCategoryDTO>> getAllCategories() {
        log.debug("GET /api/categories - Retrieving all waste categories");
        try {
            List<WasteCategoryDTO> categories = wasteCategoryService.getAllCategories();
            log.info("Retrieved {} waste categories successfully", categories.size());
            return ResponseEntity.ok(categories);
        } 
        catch (Exception e) {
            log.error("Error retrieving all categories: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get category by ID
    @Operation(
        summary = "Get waste category by ID",
        description = "Retrieves a specific waste category using its ID"
    )
    @ApiResponse(responseCode = "200", description = "Category found")
    @ApiResponse(responseCode = "404", description = "Category not found")
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<WasteCategoryDTO> getCategoryById(@PathVariable Long id) {
        log.debug("GET /api/categories/{} - Retrieving waste category", id);
        try {
            WasteCategoryDTO category = wasteCategoryService.getCategoryById(id);
            log.info("Retrieved waste category with id: {}", id);
            return ResponseEntity.ok(category);
        }
        catch (ResourceNotFoundException e) {
            log.warn("Waste category not found with id: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    // Create category
    @Operation(
        summary = "Create new waste category",
        description = "Creates a new waste category in the system"
    )
    @ApiResponse(responseCode = "201", description = "Category created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input")
    @ApiResponse(responseCode = "409", description = "Category already exists")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<WasteCategoryDTO> createCategory(@Valid @RequestBody WasteCategoryDTO categoryDTO) {
        log.debug("POST /api/categories - Creating new waste category: {}", categoryDTO);
        try {
            WasteCategoryDTO created = wasteCategoryService.createCategory(categoryDTO);
            log.info("Created new waste category with id: {}", created.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        }
        catch (DuplicateResourceException e) {
            log.warn("Duplicate waste category: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        catch (ConstraintViolationException e) {
            log.warn("Invalid waste category data: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Update category
    @Operation(
        summary = "Update waste category",
        description = "Updates an existing waste category"
    )
    @ApiResponse(responseCode = "200", description = "Category updated successfully")
    @ApiResponse(responseCode = "404", description = "Category not found")
    @ApiResponse(responseCode = "400", description = "Invalid input")
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<WasteCategoryDTO> updateCategory(@PathVariable Long id, @Valid @RequestBody WasteCategoryDTO categoryDTO) {
        log.debug("PUT /api/categories/{} - Updating waste category: {}", id, categoryDTO);
        try {
            WasteCategoryDTO updated = wasteCategoryService.updateCategory(id, categoryDTO);
            log.info("Updated waste category with id: {}", id);
            return ResponseEntity.ok(updated);
        }
        catch (ResourceNotFoundException e) {
            log.warn("Waste category not found with id: {}", id);
            return ResponseEntity.notFound().build();
        }
        catch (Exception e) {
            log.error("Error updating waste category with id {}: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    // Delete category
    @Operation(
        summary = "Delete waste category",
        description = "Deletes an existing waste category"
    )
    @ApiResponse(responseCode = "204", description = "Category deleted successfully")
    @ApiResponse(responseCode = "404", description = "Category not found")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        log.debug("DELETE /api/categories/{} - Deleting waste category", id);
        try {
            wasteCategoryService.deleteCategory(id);
            log.info("Deleted waste category with id: {}", id);
            return ResponseEntity.noContent().build();
        }
        catch (ResourceNotFoundException e) {
            log.warn("Waste category not found with id: {}", id);
            return ResponseEntity.notFound().build();
        }
        catch (RuntimeException e) {
            log.error("Error deleting waste category with id {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}