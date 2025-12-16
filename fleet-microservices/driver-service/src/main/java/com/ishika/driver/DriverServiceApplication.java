package com.ishika.driver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class DriverServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DriverServiceApplication.class, args);
    }

    @org.springframework.context.annotation.Bean
    public org.springframework.boot.CommandLineRunner seedDrivers(com.ishika.driver.repo.DriverRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                java.util.List<com.ishika.driver.domain.Driver> drivers = java.util.Arrays.asList(
                        new com.ishika.driver.domain.Driver("John Doe", "Class A", true, 4.8),
                        new com.ishika.driver.domain.Driver("Jane Smith", "Class B", true, 4.9),
                        new com.ishika.driver.domain.Driver("Mike Johnson", "Class C", false, 4.5));
                drivers.forEach(d -> d.setStatus("OFF_DUTY"));
                repository.saveAll(drivers);
                System.out.println("Drivers seeded");
            }
        };
    }

}
