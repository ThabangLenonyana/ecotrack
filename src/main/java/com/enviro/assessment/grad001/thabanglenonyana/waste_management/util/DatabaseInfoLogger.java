package com.enviro.assessment.grad001.thabanglenonyana.waste_management.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;

import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class DatabaseInfoLogger {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Autowired
    private Environment environment;
    
    @Bean
    public CommandLineRunner logDatabaseInfo() {
        return args -> {
            try {
                String[] activeProfiles = environment.getActiveProfiles();
                String profileInfo = String.join(", ", activeProfiles.length > 0 ? activeProfiles : new String[]{"default"});
                
                log.info("╔══════════════════════════════════════════════════════════════╗");
                log.info("║                   DATABASE CONNECTION INFO                   ║");
                log.info("╠══════════════════════════════════════════════════════════════╣");
                log.info("║ Active profiles: {}", String.format("%-43s ║", profileInfo));
                
                // Get database information
                String dbUrl = jdbcTemplate.queryForObject("SELECT IFNULL(DATABASE(), CURRENT_CATALOG()) AS db", String.class);
                String dbType = jdbcTemplate.queryForObject("SELECT IFNULL(VERSION(), 'H2 Database') AS version", String.class);
                
                log.info("║ Database: {}", String.format("%-50s ║", dbUrl));
                log.info("║ Database type: {}", String.format("%-45s ║", dbType));
                
                // Count tables
                Integer tableCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'", 
                    Integer.class);
                    
                log.info("║ Tables found: {}", String.format("%-47s ║", tableCount));
                log.info("║ Status: 🟢 Connected successfully                            ║");
                log.info("╚══════════════════════════════════════════════════════════════╝");
                
            } catch (Exception e) {
                log.error("╔══════════════════════════════════════════════════════════════╗");
                log.error("║                  DATABASE CONNECTION ERROR                   ║");
                log.error("╠══════════════════════════════════════════════════════════════╣");
                log.error("║ Error: {}", String.format("%-52s ║", e.getMessage()));
                log.error("║ Please check your database configuration and network settings ║");
                log.error("╚══════════════════════════════════════════════════════════════╝");
            }
        };
    }
}