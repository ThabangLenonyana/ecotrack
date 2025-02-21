package com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DisposalGuidelineDTO {
    private Long id;
    private Long categoryId;

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;

    @NotBlank(message = "Instructions are required")
    private String instructions;
}
