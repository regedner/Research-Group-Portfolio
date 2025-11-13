package com.example.researchgroup;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;


@SpringBootApplication
// MODEL sınıflarını tara
@EntityScan(basePackages = "com.example.model")
// REPOSITORY sınıflarını tara
@EnableJpaRepositories("com.example.repository")
// CONTROLLER, SERVICE, PROVIDER sınıflarını tara
@ComponentScan({
    "com.example"      // Config sınıfları
})
public class ResearchGroupBackendApplication {

    public static void main(String[] args) {
        System.out.println("=== Starting Research Group Backend ===");
        System.out.println("Scanning controllers in: com.example.controller");
        System.out.println("Scanning services in: com.example.service");
        System.out.println("Scanning providers in: com.example.provider");
        System.out.println("Scanning models in: com.example.model");
        System.out.println("Scanning repositories in: com.example.repository");
        
        SpringApplication.run(ResearchGroupBackendApplication.class, args);
        System.out.println("=== Application Started Successfully on Port 8080 ===");
        System.out.println("H2 Console: http://localhost:8080/h2-console");
        System.out.println("API Test: POST http://localhost:8080/api/members/fetch?sourceId=A5003414781");
        System.out.println("Expected Response: Member data with ID, name, publications");
    }
    
}

