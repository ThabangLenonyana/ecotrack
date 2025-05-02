package com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RecyclingLocationRepository extends JpaRepository<RecyclingLocation, Long> {
    
    // Find locations by type
    List<RecyclingLocation> findByType(String type);
    
    // Find nearby locations using Haversine formula
    @Query(value = 
        "SELECT * FROM recycling_locations " +
        "WHERE (6371 * acos(cos(radians(:latitude)) * cos(radians(latitude)) * " +
        "cos(radians(longitude) - radians(:longitude)) + " +
        "sin(radians(:latitude)) * sin(radians(latitude)))) <= :radius", 
        nativeQuery = true)
    List<RecyclingLocation> findNearbyLocations(
        @Param("latitude") double latitude, 
        @Param("longitude") double longitude, 
        @Param("radius") double radius
    );
    
    // Find locations by accepted materials
    @Query("SELECT r FROM RecyclingLocation r WHERE " +
           "(:acceptsPlastic = false OR r.acceptsPlastic = :acceptsPlastic) AND " +
           "(:acceptsPaper = false OR r.acceptsPaper = :acceptsPaper) AND " +
           "(:acceptsCardboard = false OR r.acceptsCardboard = :acceptsCardboard) AND " +
           "(:acceptsMetal = false OR r.acceptsMetal = :acceptsMetal) AND " +
           "(:acceptsEWaste = false OR r.acceptsEWaste = :acceptsEWaste) AND " +
           "(:acceptsCartons = false OR r.acceptsCartons = :acceptsCartons)")
    List<RecyclingLocation> findByAcceptedMaterials(
        @Param("acceptsPlastic") boolean acceptsPlastic,
        @Param("acceptsPaper") boolean acceptsPaper,
        @Param("acceptsCardboard") boolean acceptsCardboard,
        @Param("acceptsMetal") boolean acceptsMetal,
        @Param("acceptsEWaste") boolean acceptsEWaste,
        @Param("acceptsCartons") boolean acceptsCartons
    );

    // Find distinct cities
    @Query("SELECT DISTINCT r.city FROM RecyclingLocation r WHERE r.city IS NOT NULL ORDER BY r.city")
    List<String> findDistinctCities();
    
    // Find distinct facility types
    @Query("SELECT DISTINCT r.type FROM RecyclingLocation r WHERE r.type IS NOT NULL ORDER BY r.type")
    List<String> findDistinctTypes();
    
    // Find all available materials from the database
    @Query(value = 
        "SELECT 'plastic' as material FROM recycling_locations WHERE accepts_plastic = true " +
        "UNION SELECT 'paper' FROM recycling_locations WHERE accepts_paper = true " +
        "UNION SELECT 'cardboard' FROM recycling_locations WHERE accepts_cardboard = true " +
        "UNION SELECT 'metal' FROM recycling_locations WHERE accepts_metal = true " +
        "UNION SELECT 'ewaste' FROM recycling_locations WHERE accepts_ewaste = true " +
        "UNION SELECT 'cartons' FROM recycling_locations WHERE accepts_cartons = true " +
        "UNION SELECT 'motorOil' FROM recycling_locations WHERE accepts_motor_oil = true",
        nativeQuery = true)
    List<String> findDistinctMaterials();
}
