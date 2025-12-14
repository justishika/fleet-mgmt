package com.ishika.dispatch.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "driver-service", path = "/drivers")
public interface DriverClient {

    @GetMapping("/{id}")
    Driver getDriver(@PathVariable("id") String id);

    @GetMapping("/available")
    Driver getAvailableDriver(@RequestParam("licenseClass") String licenseClass);

    @PutMapping("/{id}/availability")
    void updateAvailability(@PathVariable("id") String id, @RequestParam("available") boolean available);

    // Simple DTO
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    class Driver {
        private String id;
        private String name;
        private Boolean availability;

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

        public Boolean getAvailability() {
            return availability;
        }

        public void setAvailability(Boolean availability) {
            this.availability = availability;
        }
    }
}
