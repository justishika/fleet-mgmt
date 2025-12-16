package com.ishika.fleet.controller;

import com.ishika.fleet.domain.Vehicle;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/vehicles")

public class VehicleController {

    private final com.ishika.fleet.service.FleetService service;

    public VehicleController(com.ishika.fleet.service.FleetService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Vehicle> create(@RequestBody @Valid Vehicle vehicle) {
        return new ResponseEntity<>(service.createVehicle(vehicle), HttpStatus.CREATED);
    }

    @GetMapping
    public List<Vehicle> list() {
        return service.getAllVehicles();
    }

    @GetMapping("/{id}")
    public Vehicle get(@PathVariable String id) {
        return service.getVehicleById(id).orElseThrow(() -> new NoSuchElementException("Vehicle not found: " + id));
    }

    @PutMapping("/{id}")
    public Vehicle update(@PathVariable String id, @RequestBody @Valid Vehicle input) {
        Vehicle updated = service.updateVehicle(id, input);
        if (updated == null) {
            throw new NoSuchElementException("Vehicle not found: " + id);
        }
        return updated;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        service.deleteVehicle(id);
    }

    @PutMapping("/{id}/assign-driver/{driverId}")
    public Vehicle assignDriver(@PathVariable String id, @PathVariable String driverId) {
        return service.assignDriver(id, driverId);
    }

    @GetMapping("/available")
    public Vehicle getAvailable(@RequestParam String type) {
        List<Vehicle> available = service.getAvailableVehicles(type);
        if (available.isEmpty()) {
            throw new IllegalStateException("No available vehicle of type: " + type);
        }
        return available.get(0);
    }

    @GetMapping("/by-plate/{plate}")
    public Vehicle getByPlate(@PathVariable String plate) {
        return service.getVehicleByPlate(plate)
                .orElseThrow(() -> new NoSuchElementException("Vehicle not found with plate: " + plate));
    }

    @PutMapping("/{id}/status")
    public void updateStatus(@PathVariable String id, @RequestParam String status) {
        service.updateVehicleStatus(id, status);
    }
}
