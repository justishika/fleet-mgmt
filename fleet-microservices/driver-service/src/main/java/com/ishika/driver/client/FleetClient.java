package com.ishika.driver.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "fleet-service", url = "${fleet.service.url:http://localhost:8081/vehicles}")
public interface FleetClient {

    @GetMapping("/by-plate/{plate}")
    Vehicle getVehicleByPlate(@PathVariable("plate") String plate);

    @PutMapping("/{id}")
    Vehicle updateVehicle(@PathVariable("id") String id, @RequestBody Vehicle vehicle);

    // DTO
    class Vehicle {
        private String id;
        private String plate;
        private String type;
        private String status;
        private String lastLocation;
        private String health;
        private String assignedDriverId;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getPlate() {
            return plate;
        }

        public void setPlate(String plate) {
            this.plate = plate;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getLastLocation() {
            return lastLocation;
        }

        public void setLastLocation(String lastLocation) {
            this.lastLocation = lastLocation;
        }

        public String getHealth() {
            return health;
        }

        public void setHealth(String health) {
            this.health = health;
        }

        public String getAssignedDriverId() {
            return assignedDriverId;
        }

        public void setAssignedDriverId(String assignedDriverId) {
            this.assignedDriverId = assignedDriverId;
        }
    }
}
