package com.enviro.assessment.grad001.thabanglenonyana.waste_management.category;

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
public class WasteCategoryController {

    private static final Logger log = LoggerFactory.getLogger(WasteCategoryController.class);

    // Inject the WasteCategoryService
    private final WasteCategoryService wasteCategoryService;

    // Get all categories
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