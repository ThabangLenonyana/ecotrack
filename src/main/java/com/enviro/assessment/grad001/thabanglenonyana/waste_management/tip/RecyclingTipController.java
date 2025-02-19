package com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tips")
public class RecyclingTipController {
    
    //TODO: Service injection

    // Get all recycling tips
    @GetMapping
    public ResponseEntity<List<RecyclingTipDTO>> getAllRecyclingTips() {
        return null;
    }

    // Get recycling tip by ID
    @GetMapping("/{id}")
    public ResponseEntity<RecyclingTipDTO> findById(Long id) {
        return null;
    }

    // Create recycling tip
    @PostMapping
    public ResponseEntity<RecyclingTipDTO> create(RecyclingTipDTO recyclingTip) {
        return null;
    }

    // Update recycling tip
    @PutMapping("/{id}")
    public ResponseEntity<RecyclingTipDTO> update(Long id, RecyclingTipDTO recyclingTip) {
        return null;
    }
    // Delete recycling tip
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Long id) {
        return null;
    }
}
