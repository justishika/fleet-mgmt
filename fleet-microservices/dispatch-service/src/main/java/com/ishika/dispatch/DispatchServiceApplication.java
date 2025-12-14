package com.ishika.dispatch;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class DispatchServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DispatchServiceApplication.class, args);
    }

    @org.springframework.context.annotation.Bean
    public org.springframework.web.client.RestTemplate restTemplate() {
        return new org.springframework.web.client.RestTemplate();
    }

    private com.ishika.dispatch.repo.UserRepository userRepository;
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Autowired
    public void setUserRepository(com.ishika.dispatch.repo.UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @org.springframework.beans.factory.annotation.Autowired
    public void setPasswordEncoder(org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @org.springframework.context.annotation.Bean
    public org.springframework.boot.CommandLineRunner seedAdmin() {
        return args -> {
            if (userRepository.findByUsername("admin@fleetwave.io").isEmpty()) {
                com.ishika.dispatch.domain.User admin = new com.ishika.dispatch.domain.User();
                admin.setUsername("admin@fleetwave.io");
                admin.setPasswordHash(passwordEncoder.encode("admin123"));
                admin.setRole(com.ishika.dispatch.domain.Role.ADMIN);
                userRepository.save(admin);
                System.out.println("Admin seeded");
            }
        };
    }

    @org.springframework.context.annotation.Bean
    public org.springframework.web.filter.CorsFilter corsFilter() {
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        org.springframework.web.cors.CorsConfiguration config = new org.springframework.web.cors.CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return new org.springframework.web.filter.CorsFilter(source);
    }
}
