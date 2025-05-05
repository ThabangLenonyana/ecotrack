package com.enviro.assessment.grad001.thabanglenonyana.waste_management.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.core.env.Environment;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class ApplicationStartupLogger implements ApplicationListener<ApplicationReadyEvent> {

    @Autowired
    private Environment environment;
    @Override
    public void onApplicationEvent(@NonNull ApplicationReadyEvent event) {
        String serverPort = environment.getProperty("server.port", "8080");
        String activeProfile = String.join(", ", environment.getActiveProfiles());
        
        log.info("╔═════════════════════════════════════════════════════════╗");
        log.info("║                         EcoTrack                        ║");
        log.info("╠═════════════════════════════════════════════════════════╣");
        log.info("║ Application started successfully!                       ║");
        log.info("║ Local access:       http://localhost:{}/                ║", serverPort);
        log.info("║ Swagger UI:         http://localhost:{}/swagger-ui.html ║", serverPort);
        log.info("║ H2 Console (dev):   http://localhost:{}/h2-console     ║", serverPort);
        log.info("║ Active profile:     {}                          ║", 
                 String.format("%-29s", activeProfile.isEmpty() ? "default" : activeProfile));
        log.info("╚═════════════════════════════════════════════════════════╝");
    }
}