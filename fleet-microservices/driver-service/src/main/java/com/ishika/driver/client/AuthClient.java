package com.ishika.driver.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "dispatch-service", url = "${dispatch.service.url:http://localhost:8083/auth}")
public interface AuthClient {

    @PostMapping("/provision-driver")
    void register(@RequestBody RegisterRequest request);

    class RegisterRequest {
        private String username;
        private String passwordHash;
        private String role;
        private String driverId;

        public RegisterRequest(String username, String passwordHash, String role, String driverId) {
            this.username = username;
            this.passwordHash = passwordHash;
            this.role = role;
            this.driverId = driverId;
        }

        public String getUsername() {
            return username;
        }

        public String getPasswordHash() {
            return passwordHash;
        }

        public String getRole() {
            return role;
        }

        public String getDriverId() {
            return driverId;
        }
    }
}
