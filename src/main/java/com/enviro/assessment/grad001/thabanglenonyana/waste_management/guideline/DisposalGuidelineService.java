package com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.exception.ResourceNotFoundException;

/**
 * This class is a service class that will be used to perform CRUD operations on the DisposalGuideline entity.
 */
@Service
@RequiredArgsConstructor
public class DisposalGuidelineService {

    // Inject the DisposalGuidelineRepository
    private final DisposalGuidelineRepository disposalGuidelineRepository;

    // Convert DisposalGuideline entity to DisposalGuidelineDTO
    private DisposalGuidelineDTO mapToDTO(DisposalGuideline guideline) {
        DisposalGuidelineDTO dto = new DisposalGuidelineDTO();
        dto.setTitle(guideline.getTitle());
        dto.setInstructions(guideline.getInstructions());
        return dto;
    }

    @Transactional(readOnly = true)
    public List<DisposalGuidelineDTO> getAllGuidelines() {
        return disposalGuidelineRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DisposalGuidelineDTO getGuidlineById(Long id) {
        return disposalGuidelineRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("DisposalGuideline", "id", id));
        
    }

    @Transactional
    public DisposalGuidelineDTO createGuideline(DisposalGuidelineDTO disposalGuideline) {
        DisposalGuideline guideline = new DisposalGuideline();
        guideline.setTitle(disposalGuideline.getTitle());
        guideline.setInstructions(disposalGuideline.getInstructions());
        return mapToDTO(disposalGuidelineRepository.save(guideline));
    }
    
}
