package com.enviro.assessment.grad001.thabanglenonyana.waste_management.category;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.exception.ResourceNotFoundException;

/**
 * Service class for managing waste category operations
 * Implements a clear DTO → Entity → Repository → Entity → DTO data flow pattern
 */
@Service
@RequiredArgsConstructor
public class WasteCategoryService {
    // Inject the WasteCategoryRepository
    private final WasteCategoryRepository wasteCategoryRepository;

    // Inject the WasteCategoryMapper
    private final WasteCategoryMapper wasteCategoryMapper;

    /**
     * Retrieves all waste categories with filtered response fields
     * @return List of WasteCategoryResponseDTO containing only specified fields
     */
    @Transactional(readOnly = true)
    public List<WasteCategoryDTO> getAllCategories() {
        return wasteCategoryRepository.findAll().stream()
                .map(wasteCategoryMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a waste category by its ID
     * @param id The ID of the waste category
     * @return The waste category wrapped in Optional
     * @throws ResourceNotFoundException if the category is not found
     */
    @Transactional(readOnly = true)
    public WasteCategoryDTO getCategoryById(Long id) {
        return wasteCategoryRepository.findById(id)
                .map(wasteCategoryMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    /**
     * Creates a new waste category
     * @param categoryDTO The waste category to create
     * @return WasteCategoryResponseDTO of the created category
     */
    @Transactional
    public WasteCategoryDTO createCategory(WasteCategoryDTO categoryDTO) {
        WasteCategory category = wasteCategoryMapper.toEntity(categoryDTO);
        WasteCategory savedCategory = wasteCategoryRepository.save(category);
        return wasteCategoryMapper.toDTO(savedCategory);
    }

    /**
     * Updates an existing waste category
     * @param id The ID of the category to update
     * @param requestDTO The updated category details
     * @return The updated waste category
     * @throws ResourceNotFoundException if the category is not found
     */
    @Transactional
    public WasteCategoryDTO updateCategory(Long id, WasteCategoryDTO categoryDTO) {
        WasteCategory category = wasteCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        
        wasteCategoryMapper.updateEntity(category, categoryDTO);
        WasteCategory updatedCategory = wasteCategoryRepository.save(category);
        return wasteCategoryMapper.toDTO(updatedCategory);
    }

    /**
     * Deletes a waste category
     * @param id The ID of the category to delete
     * @throws ResourceNotFoundException if the category is not found
     */
    @Transactional
    public void deleteCategory(Long id) {
        if (!wasteCategoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with id: " + id);
        }
        wasteCategoryRepository.deleteById(id);
    }   

        /**
     * Finds a waste category by its name
     * @param name The name of the category to find
     * @return The waste category entity
     * @throws ResourceNotFoundException if the category is not found
     */
    @Transactional(readOnly = true)
    public WasteCategory findByCategoryName(String name) {
        return wasteCategoryRepository.findByNameIgnoreCase(name)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with name: " + name));
    }
}