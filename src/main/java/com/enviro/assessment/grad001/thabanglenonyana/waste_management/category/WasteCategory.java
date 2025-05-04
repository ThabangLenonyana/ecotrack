package com.enviro.assessment.grad001.thabanglenonyana.waste_management.category;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
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

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline.DisposalGuideline;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip.RecyclingTip;
import com.fasterxml.jackson.annotation.JsonManagedReference;


/**
 * Entity class representing a waste category in the system.
 * Uses JPA annotations for persistence and validation constraints for data integrity.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "waste_categories")
public class WasteCategory{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Category name is required")
    @Size(min = 3, max = 50, message = "Category name must be between 3 and 50 characters")
    @Column(unique = true, nullable = false, length = 50)
    private String name;

    @NotBlank(message = "Category description is required")
    @Size(min = 3, max = 510, message = "Description must be between 3 and 510 characters")
    @Column(length = 510)
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @JsonManagedReference
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<DisposalGuideline> disposalGuidelines;

    @JsonManagedReference
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<RecyclingTip> recyclingTips;
}
