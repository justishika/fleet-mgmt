package com.ishika.dispatch.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "fleet-service", path = "/vehicles")
public interface FleetClient {

    @GetMapping("/{id}")
    Vehicle getVehicle(@PathVariable("id") String id);

    @GetMapping("/available")
    Vehicle getAvailableVehicle(@RequestParam("type") String type);

    @PutMapping("/{id}/status")
    void updateStatus(@PathVariable("id") String id, @RequestParam("status") String status);

    // We might need to update vehicle status?
    // Current FleetController just has update(Vehicle).
    // Let's add partial update or just use update.
    // For now we just read.

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    class Vehicle {
        private String id;
        private String plate;
        private String type;
        private String status;
        private String assignedDriverId;

        // getters setters
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

        public String getAssignedDriverId() {
            return assignedDriverId;
        }

        public void setAssignedDriverId(String assignedDriverId) {
            this.assignedDriverId = assignedDriverId;
        }
    }
}
