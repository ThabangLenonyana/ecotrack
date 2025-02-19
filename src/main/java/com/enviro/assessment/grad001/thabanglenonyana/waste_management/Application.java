package com.enviro.assessment.grad001.thabanglenonyana.waste_management;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.enviro.assessment.grad001.thabanglenonyana.waste_management.category.WasteCategoryRepository;

@SpringBootApplication
public class Application {

	private static final Logger log = LoggerFactory.getLogger(Application.class);

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
		log.info("Application started successfully");
	}

	@Bean
    public CommandLineRunner dataLoader(WasteCategoryRepository categoryRepo) {
        return args -> {
            log.info("Number of categories loaded: {}", categoryRepo.count());
        };
    }

}
