package com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline;

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
 * This class is a service class that will be used to perform CRUD operations on the DisposalGuideline entity.
 */
@Service
@RequiredArgsConstructor
@Validated
public class DisposalGuidelineService {

    // Inject the DisposalGuidelineRepository
    private final DisposalGuidelineRepository guidelineRepository;
    private final WasteCategoryRepository categoryRepository;
    private final DisposalGuidelineMapper guidelineMapper;

    /**
     * Retrieves all disposal guidelines
     * @return List of DisposalGuidelineDTO
     */
    @Transactional(readOnly = true)
    public List<DisposalGuidelineDTO> getAllGuidelines() {
        return guidelineRepository.findAll().stream()
                .map(guidelineMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a disposal guideline by its ID
     * @param id The ID of the disposal guideline
     * @return The disposal guideline wrapped in DisposalGuidelineDTO
     * @throws ResourceNotFoundException if the guideline is not found
     */
    @Transactional(readOnly = true)
    public DisposalGuidelineDTO getGuidelineById(Long id) {
        return guidelineRepository.findById(id)
                .map(guidelineMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Guideline not found with id: " + id));
    }

    /**
     * Creates a new disposal guideline and assigns it to a category
     * @param guidelineDTO The guideline to create
     * @param categoryId The ID of the category to assign the guideline to
     * @return The created DisposalGuidelineDTO
     * @throws ResourceNotFoundException if the category is not found
     * @throws DuplicateResourceException if a guideline with the same title already exists
     * 
     */
    @Transactional
    public DisposalGuidelineDTO createGuideline(@Valid DisposalGuidelineDTO guidelineDTO) {
         // Validate title uniqueness
         if (guidelineRepository.existsByTitle(guidelineDTO.getTitle())) {
            throw new DuplicateResourceException("Guideline with title already exists: " + guidelineDTO.getTitle());
        }
        DisposalGuideline guideline = guidelineMapper.toEntity(guidelineDTO);

        DisposalGuideline savedGuideline = guidelineRepository.save(guideline);
        return guidelineMapper.toDTO(savedGuideline);
    }
    
    /**
     * Updates an existing disposal guideline
     * @param id The ID of the guideline to update
     * @param guidelineDTO The updated guideline details
     * @return The updated DisposalGuidelineDTO
     * @throws ResourceNotFoundException if the guideline is not found
     * @throws DuplicateResourceException if a guideline with the same title already exists
     */
    @Transactional
    public DisposalGuidelineDTO updateGuideline(Long id, @Valid DisposalGuidelineDTO guidelineDTO) {
        DisposalGuideline guideline = guidelineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Guideline not found with id: " + id));

        // Check title uniqueness if changed
        if (!guideline.getTitle().equals(guidelineDTO.getTitle()) &&
                guidelineRepository.existsByTitle(guidelineDTO.getTitle())) {
            throw new DuplicateResourceException("Guideline with title already exists: " + guidelineDTO.getTitle());
        }

        guidelineMapper.updateEntity(guideline, guidelineDTO);
        DisposalGuideline updatedGuideline = guidelineRepository.save(guideline);
        return guidelineMapper.toDTO(updatedGuideline);
    }

        /**
     * Assigns a guideline to a different category
     * @param guidelineId The ID of the guideline
     * @param categoryId The ID of the new category
     * @return The updated DisposalGuidelineDTO
     * @throws ResourceNotFoundException if either guideline or category is not found
     * @throws IllegalOperationException if the guideline is already assigned to the category
     */
    @Transactional
    public DisposalGuidelineDTO assignToCategory(Long guidelineId, Long categoryId) {
        DisposalGuideline guideline = guidelineRepository.findById(guidelineId)
                .orElseThrow(() -> new ResourceNotFoundException("Guideline not found with id: " + guidelineId));

        // Validate if already assigned to same category
        if (guideline.getCategory() != null && guideline.getCategory().getId().equals(categoryId)) {
            throw new IllegalOperationException("Guideline is already assigned to this category");
        }

        WasteCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        guideline.setCategory(category);
        DisposalGuideline updatedGuideline = guidelineRepository.save(guideline);
        return guidelineMapper.toDTO(updatedGuideline);
    }

    /**
     * Unassigns a guideline from its current category
     * @param guidelineId The ID of the guideline to unassign
     * @return The updated DisposalGuidelineDTO
     * @throws ResourceNotFoundException if the guideline is not found
     */
    @Transactional
    public DisposalGuidelineDTO unassignGuideline(Long guidelineId) {
        DisposalGuideline guideline = guidelineRepository.findById(guidelineId)
                .orElseThrow(() -> new ResourceNotFoundException("Guideline not found with id: " + guidelineId));

        guideline.setCategory(null);
        DisposalGuideline updatedGuideline = guidelineRepository.save(guideline);
        return guidelineMapper.toDTO(updatedGuideline);
    }

    /**
     * Deletes a disposal guideline
     * @param id The ID of the guideline to delete
     * @throws ResourceNotFoundException if the guideline is not found
     * @throws IllegalOperationException if deletion is not allowed
     */
    @Transactional
    public void deleteGuideline(Long id) {
        if (!guidelineRepository.existsById(id)) {
            throw new ResourceNotFoundException("Guideline not found with id: " + id);
        }

        guidelineRepository.deleteById(id);
    }
}
