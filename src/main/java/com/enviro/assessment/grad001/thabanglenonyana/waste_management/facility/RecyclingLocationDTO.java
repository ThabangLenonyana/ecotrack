package com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility;

import java.util.HashMap;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecyclingLocationDTO {
    
    private Long id;
    private double latitude;
    private double longitude;
    private String name;
    private String municipality;
    private String city;
    private String type;
    private String operation;
    private String website;
    private String other;
    private String groupName;

    // Structured representation of accepted materials
    @Builder.Default
    private Map<String, Boolean> acceptedMaterials = new HashMap<>();

    // Optional field for distance to the location(KM)
    private double distance;

    // Calculate distance between this location and given coordinates (using Haversine formula)
    public void calculateDistance(double referenceLatitude, double referenceLongitude) {
        final double EARTH_RADIUS = 6371.0; // Radius of the Earth in kilometers

        double latDistance = Math.toRadians(this.latitude - referenceLatitude);
        double lonDistance = Math.toRadians(this.longitude - referenceLongitude);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(referenceLatitude)) * Math.cos(Math.toRadians(this.latitude))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        this.distance = EARTH_RADIUS * c;
    }
}
