package com.enviro.assessment.grad001.thabanglenonyana.waste_management.facility;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Component;

@Component
public class RecyclingLocationMapper {
    
    /**
     * Convert entity to DTO
     * 
     * @param location the recycling location entity
     * @return the recycling location DTO
     */
    public RecyclingLocationDTO toDto(RecyclingLocation location) {
        if (location == null) {
            return null;
        }
        
        RecyclingLocationDTO dto = new RecyclingLocationDTO();
        dto.setId(location.getId());
        dto.setLatitude(location.getLatitude());
        dto.setLongitude(location.getLongitude());
        dto.setName(location.getName());
        dto.setMunicipality(location.getMunicipality());
        dto.setCity(location.getCity());
        dto.setType(location.getType());
        dto.setOperation(location.getOperation());
        dto.setWebsite(location.getWebsite());
        dto.setOther(location.getOther());
        dto.setGroupName(location.getGroupName());
        
        // Set accepted materials
        Map<String, Boolean> acceptedMaterials = new HashMap<>();
        acceptedMaterials.put("plastic", location.getAcceptsPlastic());
        acceptedMaterials.put("paper", location.getAcceptsPaper());
        acceptedMaterials.put("cardboard", location.getAcceptsCardboard());
        acceptedMaterials.put("cans", location.getAcceptsCans());
        acceptedMaterials.put("cartons", location.getAcceptsCartons());
        acceptedMaterials.put("ewaste", location.getAcceptsEWaste());
        acceptedMaterials.put("metal", location.getAcceptsMetal());
        acceptedMaterials.put("motorOil", location.getAcceptsMotorOil());
        
        dto.setAcceptedMaterials(acceptedMaterials);
        
        return dto;
    }
    
    /**
     * Convert DTO to entity
     * 
     * @param dto the recycling location DTO
     * @return the recycling location entity
     */
    public RecyclingLocation toEntity(RecyclingLocationDTO dto) {
        if (dto == null) {
            return null;
        }
        
        RecyclingLocation entity = new RecyclingLocation();
        entity.setId(dto.getId());
        entity.setLatitude(dto.getLatitude());
        entity.setLongitude(dto.getLongitude());
        entity.setName(dto.getName());
        entity.setMunicipality(dto.getMunicipality());
        entity.setCity(dto.getCity());
        entity.setType(dto.getType());
        entity.setOperation(dto.getOperation());
        entity.setWebsite(dto.getWebsite());
        entity.setOther(dto.getOther());
        entity.setGroupName(dto.getGroupName());
        
        // Set accepted materials from map if available
        Map<String, Boolean> materials = dto.getAcceptedMaterials();
        if (materials != null) {
            entity.setAcceptsPlastic(getBooleanValue(materials, "plastic"));
            entity.setAcceptsPaper(getBooleanValue(materials, "paper"));
            entity.setAcceptsCardboard(getBooleanValue(materials, "cardboard"));
            entity.setAcceptsCans(getBooleanValue(materials, "cans"));
            entity.setAcceptsCartons(getBooleanValue(materials, "cartons"));
            entity.setAcceptsEWaste(getBooleanValue(materials, "ewaste"));
            entity.setAcceptsMetal(getBooleanValue(materials, "metal"));
            entity.setAcceptsMotorOil(getBooleanValue(materials, "motorOil"));
        }
        
        return entity;
    }
    
    private boolean getBooleanValue(Map<String, Boolean> map, String key) {
        return map.getOrDefault(key, false);
    }
}
