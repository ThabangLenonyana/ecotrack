package com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip;

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
 * Controller for managing recycling tips
 * Provides REST endpoints for CRUD operations and category assignment
 */
@RestController
@RequestMapping("/api/tips")
@RequiredArgsConstructor
public class RecyclingTipController {
    
    private final RecyclingTipService tipService;

    // Get all recycling tips
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<RecyclingTipDTO>> getAllRecyclingTips() {
        try {
            List<RecyclingTipDTO> tips = tipService.getAllTips();
            return ResponseEntity.ok(tips);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get recycling tip by ID
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<RecyclingTipDTO> findById(@PathVariable Long id) {
        try {
            RecyclingTipDTO tip = tipService.getTipById(id);
            return ResponseEntity.ok(tip);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Create recycling tip
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<RecyclingTipDTO> create(@Valid @RequestBody RecyclingTipDTO tipDTO) {
        try {
            RecyclingTipDTO created = tipService.createTip(tipDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (DuplicateResourceException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Update recycling tip
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<RecyclingTipDTO> update(
            @PathVariable Long id, 
            @Valid @RequestBody RecyclingTipDTO tipDTO) {
        try {
            RecyclingTipDTO updated = tipService.updateTip(id, tipDTO);
            return ResponseEntity.ok(updated);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (DuplicateResourceException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    // Delete recycling tip
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            tipService.deleteTip(id);
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Assign tip to category
    @PatchMapping("/{tipId}/assign/{categoryId}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<RecyclingTipDTO> assignToCategory(
            @PathVariable Long tipId,
            @PathVariable Long categoryId) {
        try {
            RecyclingTipDTO updated = tipService.assignToCategory(tipId, categoryId);
            return ResponseEntity.ok(updated);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalOperationException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Unassign tip from current category
    @PatchMapping("/{tipId}/unassign")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<RecyclingTipDTO> unassignTip(@PathVariable Long tipId) {
        try {
            RecyclingTipDTO updated = tipService.unassignTip(tipId);
            return ResponseEntity.ok(updated);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}