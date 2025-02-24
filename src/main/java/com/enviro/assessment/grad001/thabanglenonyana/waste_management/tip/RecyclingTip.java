package com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.category.WasteCategory;
import com.fasterxml.jackson.annotation.JsonBackReference;



/**
 * Entity class representing recycling tips for waste categories.
 * Provides helpful information about recycling specific types of waste.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "recycling_tips")
public class RecyclingTip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    @Column(unique = true, nullable = false, length = 100)
    private String title;

    @NotBlank(message = "Steps are required")
    @Column(columnDefinition = "json")
    @Convert(converter = JsonConverter.class)
    private List<String> steps;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DifficultyLevel difficulty = DifficultyLevel.MEDIUM;

    @Column(columnDefinition = "TEXT")
    private String environmentalImpact;

    @Column(nullable = false)
    private String timeRequired;

    @Column(columnDefinition = "TEXT")
    private String requiredMaterials;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "category_id")
    private WasteCategory category;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

