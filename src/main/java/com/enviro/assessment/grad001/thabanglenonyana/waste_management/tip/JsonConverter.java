package com.enviro.assessment.grad001.thabanglenonyana.waste_management.tip;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Converter
public class JsonConverter implements AttributeConverter<List<String>, String> {
    
    private static final Logger log = LoggerFactory.getLogger(JsonConverter.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<String> attribute) {
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (Exception e) {
            log.error("Error converting list to JSON: {}", e.getMessage());
            throw new RuntimeException("Error converting list to JSON", e);
        }
    }

    @Override
    public List<String> convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        
        try {
            // Try parsing as JSON array first
            try {
                return objectMapper.readValue(dbData, new TypeReference<List<String>>() {});
            } catch (Exception e) {
                log.debug("Failed to parse as JSON array, attempting to parse JSON string: {}", e.getMessage());
                // If that fails, try parsing as a JSON string that contains an array
                return objectMapper.readValue(objectMapper.readTree(dbData).asText(), new TypeReference<List<String>>() {});
            }
        } catch (Exception e) {
            log.error("Error converting JSON to list. Input: '{}', Error: {}", dbData, e.getMessage());
            throw new RuntimeException("Error converting JSON to list: " + e.getMessage(), e);
        }
    }
}