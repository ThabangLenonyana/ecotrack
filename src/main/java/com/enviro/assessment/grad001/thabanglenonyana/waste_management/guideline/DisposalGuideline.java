package com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.category.WasteCategory;
import com.fasterxml.jackson.annotation.JsonBackReference;

/**
 * Entity class representing disposal guidelines for waste categories.
 * Contains instructions for proper waste disposal methods.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "disposal_guidelines")
public class DisposalGuideline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    @Column(unique = true, nullable = false, length = 100)
    private String title;

    @NotBlank(message = "Instructions are required")
    @Column(name = "instructions", columnDefinition = "TEXT", nullable = false)
    private String instructions;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "category_id")
    private WasteCategory category;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}