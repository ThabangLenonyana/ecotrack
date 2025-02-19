package com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/guidelines")
public class DisposalGuidelineController {
    
    // TODO: Service injection


    // Get all disposal guidelines
    @GetMapping
    public ResponseEntity<List<DisposalGuidelineDTO>> getAllDisposalGuidelines() {
        return null;
    }

    // Get disposal guideline by ID
    @GetMapping("/{id}")
    public ResponseEntity<DisposalGuidelineDTO> findById(Long id) {
        return null;
    }

    // Create disposal guideline
    @PostMapping
    public ResponseEntity<DisposalGuidelineDTO> create(DisposalGuidelineDTO disposalGuideline) {
        return null;
    }

    // Update disposal guideline
    @PutMapping("/{id}")
    public ResponseEntity<DisposalGuidelineDTO> update(Long id, DisposalGuidelineDTO disposalGuideline) {
        return null;
    }

    // Delete disposal guideline
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Long id) {
        return null;
    }
}
