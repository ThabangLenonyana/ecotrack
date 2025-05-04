package com.enviro.assessment.grad001.thabanglenonyana.waste_management.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import lombok.extern.slf4j.Slf4j;

import java.util.Arrays;

@Configuration
@Slf4j
public class ProfileConfig {
    
    @Autowired
    private Environment environment;
    
    @Bean
    public CommandLineRunner profileVerifier() {
        return args -> {
            String[] profiles = environment.getActiveProfiles();
            log.info("╔══════════════════════════════════════════════════════╗");
            log.info("║              PROFILE VERIFICATION                    ║");
            log.info("╠══════════════════════════════════════════════════════╣");
            
            if (profiles.length == 0) {
                log.info("║ No active profile set. Using default profile.         ║");
            } else {
                log.info("║ Active profiles: {}                              ║", 
                      String.format("%-36s", Arrays.toString(profiles)));
            }
            
            // Check for prod profile specifically
            if (Arrays.asList(profiles).contains("prod")) {
                log.info("║ Production profile is ACTIVE                         ║");
                log.info("║ EnvConfig.java properties will be applied            ║");
            } else {
                log.info("║ Production profile is NOT active                     ║");
                log.info("║ EnvConfig.java will NOT be loaded                    ║");
            }
            
            log.info("╚══════════════════════════════════════════════════════╝");
        };
    }
}
