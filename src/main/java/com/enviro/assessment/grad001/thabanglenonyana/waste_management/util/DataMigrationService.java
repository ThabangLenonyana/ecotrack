package com.enviro.assessment.grad001.thabanglenonyana.waste_management.util;

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility.RecyclingLocation;
import com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility.RecyclingLocationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@Profile("prod")
public class DataMigrationService {

    private final RecyclingLocationRepository recyclingLocationRepository;

    @Autowired
    public DataMigrationService(RecyclingLocationRepository recyclingLocationRepository) {
        this.recyclingLocationRepository = recyclingLocationRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void migrateRecyclingLocations() {
        log.info("Checking if recycling locations need to be migrated...");
        
        if (recyclingLocationRepository.count() > 0) {
            log.info("Recycling locations data already exists. Skipping migration.");
            return;
        }
        
        log.info("Starting recycling locations data migration from CSV");
        List<RecyclingLocation> locations = new ArrayList<>();
        
        try {
            ClassPathResource resource = new ClassPathResource("mapData.csv");
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream()))) {
                String line;
                
                while ((line = reader.readLine()) != null) {
                    String[] values = line.split(",");
                    
                    // Skip invalid lines
                    if (values.length < 10) {
                        continue;
                    }
                    
                    try {
                        RecyclingLocation location = new RecyclingLocation();
                        location.setId(Long.parseLong(values[0]));
                        location.setLatitude(Double.parseDouble(values[1]));
                        location.setLongitude(Double.parseDouble(values[2]));
                        location.setName(values[3]);
                        
                        if (values.length > 4) location.setMunicipality(values[4]);
                        if (values.length > 5) location.setCity(values[5]);
                        if (values.length > 6) location.setType(values[6]);
                        if (values.length > 7) location.setOperation(values[7]);
                        if (values.length > 8) location.setGroupName(values[8]);
                        if (values.length > 9) location.setWebsite(values[9]);
                        if (values.length > 10) location.setOther(values[10]);
                        
                        // Process boolean fields
                        if (values.length > 11) location.setAcceptsCans("y".equalsIgnoreCase(values[11]));
                        if (values.length > 12) location.setAcceptsCardboard("y".equalsIgnoreCase(values[12]));
                        if (values.length > 13) location.setAcceptsCartons("y".equalsIgnoreCase(values[13]));
                        if (values.length > 14) location.setIsDropoffSite("yes".equalsIgnoreCase(values[14]));
                        if (values.length > 15) location.setAcceptsEWaste("y".equalsIgnoreCase(values[15]));
                        if (values.length > 16) location.setAcceptsMetal("y".equalsIgnoreCase(values[16]));
                        if (values.length > 17) location.setAcceptsMotorOil("y".equalsIgnoreCase(values[17]));
                        if (values.length > 18) location.setIsPaid("yes".equalsIgnoreCase(values[18]));
                        if (values.length > 19) location.setAcceptsPaper("y".equalsIgnoreCase(values[19]));
                        if (values.length > 20) location.setAcceptsPlastic("y".equalsIgnoreCase(values[20]));
                        
                        location.setCreatedAt(LocalDateTime.now());
                        location.setUpdatedAt(LocalDateTime.now());
                        
                        locations.add(location);
                    } catch (NumberFormatException e) {
                        log.warn("Error parsing location data: {}", line, e);
                    }
                }
            }
            
            if (!locations.isEmpty()) {
                recyclingLocationRepository.saveAll(locations);
                log.info("Successfully migrated {} recycling locations to Azure SQL Database", locations.size());
            } else {
                log.warn("No valid locations found in CSV file");
            }
            
        } catch (IOException e) {
            log.error("Error reading mapData.csv: {}", e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error during data migration: {}", e.getMessage(), e);
        }
    }
}