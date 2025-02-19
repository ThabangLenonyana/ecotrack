package com.enviro.assessment.grad001.thabanglenonyana.waste_management.guideline;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DisposalGuidelineRepository extends JpaRepository<DisposalGuideline, Long> {

}
