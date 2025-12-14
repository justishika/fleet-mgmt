package com.ishika.driver.controller;

import com.ishika.driver.domain.Driver;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/drivers")
@CrossOrigin(origins = "*")
public class DriverController {

    private final com.ishika.driver.service.DriverService service;

    public DriverController(com.ishika.driver.service.DriverService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Driver> create(@RequestBody @Valid Driver driver) {
        return new ResponseEntity<>(service.createDriver(driver), HttpStatus.CREATED);
    }

    @GetMapping
    public List<Driver> list() {
        return service.getAllDrivers();
    }

    @GetMapping("/{id}")
    public Driver get(@PathVariable String id) {
        return service.getDriverById(id).orElseThrow(() -> new NoSuchElementException("Driver not found: " + id));
    }

    @PutMapping("/{id}")
    public Driver update(@PathVariable String id, @RequestBody @Valid Driver input) {
        Driver updated = service.updateDriver(id, input);
        if (updated == null) {
            throw new NoSuchElementException("Driver not found: " + id);
        }
        return updated;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        // service.deleteDriver handles void, but we might want to check existence if
        // strict
        service.deleteDriver(id);
    }

    @GetMapping("/available")
    public Driver getAvailable(@RequestParam String licenseClass) {
        List<Driver> available = service.getAvailableDrivers(licenseClass);
        if (available.isEmpty()) {
            throw new IllegalStateException("No available driver with license: " + licenseClass);
        }
        return available.get(0);
    }

    @PostMapping("/{id}/leave")
    public void applyLeave(@PathVariable String id) {
        service.applyLeave(id);
    }

    @PostMapping("/{id}/emergency")
    public void raiseEmergency(@PathVariable String id) {
        service.raiseEmergency(id);
    }

    @PutMapping("/{id}/location")
    public void updateLocation(@PathVariable String id, @RequestParam(required = false) String location,
            @RequestParam(required = false) String destination) {
        service.updateLocation(id, location, destination);
    }

    @PutMapping("/{id}/availability")
    public void updateAvailability(@PathVariable String id, @RequestParam boolean available) {
        service.updateAvailability(id, available);
    }
}
