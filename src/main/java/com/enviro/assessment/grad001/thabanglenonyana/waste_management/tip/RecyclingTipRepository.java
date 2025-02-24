package com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecyclingTipRepository extends JpaRepository<RecyclingTip, Long> {
    boolean existsByTitle(String title);
}