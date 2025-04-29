package com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "recycling_locations")

public class RecyclingLocation {

    @Id
    private Long id;
    
    @NotNull
    @Column(nullable = false)
    private double latitude;

    @NotNull
    @Column(nullable = false)
    private double longitude;

    @NotNull
    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = true, length = 150)
    private String municipality;

    @Column(name = "city", length = 150)
    private String city;

    private String type;
    private String website;
    private String other;
    
    @Column(name = "operation", columnDefinition = "TEXT")
    private String operation;
    
    @Column(name = "group_name")
    private String groupName;


    @Column(name = "accepts_cans")
    private Boolean acceptsCans = false;

    @Column(name = "accepts_cardboard")
    private Boolean acceptsCardboard = false;

    @Column(name = "accepts_cartons")
    private Boolean acceptsCartons = false;

    @Column(name = "is_dropoff_site")
    private Boolean isDropoffSite = false;

    @Column(name = "accepts_ewaste")
    private Boolean acceptsEWaste = false;

    @Column(name = "accepts_metal")
    private Boolean acceptsMetal = false;

    @Column(name = "accepts_motor_oil")
    private Boolean acceptsMotorOil = false;

    @Column(name = "is_paid")
    private Boolean isPaid = false;

    @Column(name = "accepts_paper")
    private Boolean acceptsPaper = false;

    @Column(name = "accepts_plastic")
    private Boolean acceptsPlastic = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;



}
