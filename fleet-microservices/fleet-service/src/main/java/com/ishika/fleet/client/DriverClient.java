package com.ishika.fleet.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "driver-service", path = "/drivers")
public interface DriverClient {

    @GetMapping("/{id}")
    Driver getDriver(@PathVariable("id") String id);

    @GetMapping("/available")
    Driver getAvailableDriver(@RequestParam("licenseClass") String licenseClass);

    // Minimal DTO for Driver response
    class Driver {
        private String id;
        private String name;
        private String assignedVehicle;

        // getters setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getAssignedVehicle() {
            return assignedVehicle;
        }

        public void setAssignedVehicle(String assignedVehicle) {
            this.assignedVehicle = assignedVehicle;
        }
    }
}
