package com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.category.WasteCategory;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.category.WasteCategoryRepository;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.exception.DuplicateResourceException;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.exception.IllegalOperationException;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.exception.ResourceNotFoundException;

/**
 * Service class for managing recycling tips
 * Handles CRUD operations and category assignments
 */
@Service
@RequiredArgsConstructor
@Validated
public class RecyclingTipService {

    private final RecyclingTipRepository tipRepository;
    private final WasteCategoryRepository categoryRepository;
    private final RecyclingTipMapper tipMapper;

    /**
     * Retrieves all recycling tips
     * @return List of RecyclingTipDTO
     */
    @Transactional(readOnly = true)
    public List<RecyclingTipDTO> getAllTips() {
        return tipRepository.findAll().stream()
                .map(tipMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a recycling tip by its ID
     * @param id The ID of the recycling tip
     * @return The recycling tip wrapped in RecyclingTipDTO
     * @throws ResourceNotFoundException if the tip is not found
     */
    @Transactional(readOnly = true)
    public RecyclingTipDTO getTipById(Long id) {
        return tipRepository.findById(id)
                .map(tipMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Recycling tip not found with id: " + id));
    }

    /**
     * Creates a new recycling tip
     * @param tipDTO The tip to create
     * @return The created RecyclingTipDTO
     * @throws DuplicateResourceException if a tip with the same title already exists
     */
    @Transactional
    public RecyclingTipDTO createTip(@Valid RecyclingTipDTO tipDTO) {
        // Validate title uniqueness
        if (tipRepository.existsByTitle(tipDTO.getTitle())) {
            throw new DuplicateResourceException("Recycling tip with title already exists: " + tipDTO.getTitle());
        }

        RecyclingTip tip = tipMapper.toEntity(tipDTO);
        
        // If categoryId is provided, set the category
        if (tipDTO.getCategoryId() != null) {
            WasteCategory category = categoryRepository.findById(tipDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + tipDTO.getCategoryId()));
            tipMapper.setCategory(tip, category);
        }

        RecyclingTip savedTip = tipRepository.save(tip);
        return tipMapper.toDTO(savedTip);
    }

    /**
     * Updates an existing recycling tip
     * @param id The ID of the tip to update
     * @param tipDTO The updated tip details
     * @return The updated RecyclingTipDTO
     * @throws ResourceNotFoundException if the tip is not found
     * @throws DuplicateResourceException if a tip with the same title already exists
     */
    @Transactional
    public RecyclingTipDTO updateTip(Long id, @Valid RecyclingTipDTO tipDTO) {
        RecyclingTip tip = tipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recycling tip not found with id: " + id));

        // Check title uniqueness if changed
        if (!tip.getTitle().equals(tipDTO.getTitle()) &&
                tipRepository.existsByTitle(tipDTO.getTitle())) {
            throw new DuplicateResourceException("Recycling tip with title already exists: " + tipDTO.getTitle());
        }

        tipMapper.updateEntity(tip, tipDTO);
        RecyclingTip updatedTip = tipRepository.save(tip);
        return tipMapper.toDTO(updatedTip);
    }

    /**
     * Assigns a tip to a category
     * @param tipId The ID of the tip
     * @param categoryId The ID of the category
     * @return The updated RecyclingTipDTO
     * @throws ResourceNotFoundException if either tip or category is not found
     * @throws IllegalOperationException if the tip is already assigned to the category
     */
    @Transactional
    public RecyclingTipDTO assignToCategory(Long tipId, Long categoryId) {
        RecyclingTip tip = tipRepository.findById(tipId)
                .orElseThrow(() -> new ResourceNotFoundException("Recycling tip not found with id: " + tipId));

        // Validate if already assigned to same category
        if (tip.getCategory() != null && tip.getCategory().getId().equals(categoryId)) {
            throw new IllegalOperationException("Recycling tip is already assigned to this category");
        }

        WasteCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        tipMapper.setCategory(tip, category);
        RecyclingTip updatedTip = tipRepository.save(tip);
        return tipMapper.toDTO(updatedTip);
    }

    /**
     * Unassigns a tip from its current category
     * @param tipId The ID of the tip to unassign
     * @return The updated RecyclingTipDTO
     * @throws ResourceNotFoundException if the tip is not found
     */
    @Transactional
    public RecyclingTipDTO unassignTip(Long tipId) {
        RecyclingTip tip = tipRepository.findById(tipId)
                .orElseThrow(() -> new ResourceNotFoundException("Recycling tip not found with id: " + tipId));

        tipMapper.setCategory(tip, null);
        RecyclingTip updatedTip = tipRepository.save(tip);
        return tipMapper.toDTO(updatedTip);
    }

    /**
     * Deletes a recycling tip
     * @param id The ID of the tip to delete
     * @throws ResourceNotFoundException if the tip is not found
     */
    @Transactional
    public void deleteTip(Long id) {
        if (!tipRepository.existsById(id)) {
            throw new ResourceNotFoundException("Recycling tip not found with id: " + id);
        }
        
        tipRepository.deleteById(id);
    }
}
