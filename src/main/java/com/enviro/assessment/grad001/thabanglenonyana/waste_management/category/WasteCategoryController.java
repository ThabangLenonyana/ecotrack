package com.enviro.assessment.grad001.thabanglenonyana.waste_management.category;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

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

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.exception.ResourceNotFoundException;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class WasteCategoryController {

    private final WasteCategoryService wasteCategoryService;

    // Get all categories
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<WasteCategoryDTO>> getAllCategories() {
        try {
            List<WasteCategoryDTO> categories = wasteCategoryService.getAllCategories();
            return ResponseEntity.ok(categories);
        } 
        catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get category by ID
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<WasteCategoryDTO> getCategoryById(@PathVariable Long id) {
        try {
            WasteCategoryDTO category = wasteCategoryService.getCategoryById(id);
            return ResponseEntity.ok(category);
        }
        catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Create category
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<WasteCategoryDTO> createCategory(@Valid @RequestBody WasteCategoryDTO categoryDTO) {
        try {
            WasteCategoryDTO created = wasteCategoryService.createCategory(categoryDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        }
        catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Update category
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<WasteCategoryDTO> updateCategory(@PathVariable Long id, @Valid @RequestBody WasteCategoryDTO categoryDTO) {
        try {
            WasteCategoryDTO updated = wasteCategoryService.updateCategory(id, categoryDTO);
            return ResponseEntity.ok(updated);
        }
        catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
        catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Delete category
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        try {
            wasteCategoryService.deleteCategory(id);
            return ResponseEntity.noContent().build();
        }
        catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
        catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}