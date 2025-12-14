package com.ishika.fleet.service;

import com.ishika.fleet.client.DriverClient;
import com.ishika.fleet.domain.Vehicle;
import com.ishika.fleet.repo.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.NoSuchElementException;

@Service
public class FleetService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private DriverClient driverClient;

    public Vehicle createVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Optional<Vehicle> getVehicleById(String id) {
        return vehicleRepository.findById(id);
    }

    public Vehicle updateVehicle(String id, Vehicle vehicle) {
        return vehicleRepository.findById(id).map(existing -> {
            if (vehicle.getPlate() != null)
                existing.setPlate(vehicle.getPlate());
            if (vehicle.getType() != null)
                existing.setType(vehicle.getType());
            if (vehicle.getStatus() != null)
                existing.setStatus(vehicle.getStatus());
            if (vehicle.getLastLocation() != null)
                existing.setLastLocation(vehicle.getLastLocation());
            if (vehicle.getAssignedDriverId() != null)
                existing.setAssignedDriverId(vehicle.getAssignedDriverId());
            if (vehicle.getHealth() != null)
                existing.setHealth(vehicle.getHealth());
            return vehicleRepository.save(existing);
        }).orElse(null);
    }

    public void deleteVehicle(String id) {
        vehicleRepository.deleteById(id);
    }

    public Vehicle assignDriver(String vehicleId, String driverId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new NoSuchElementException("Vehicle not found"));

        if (driverId != null) {
            // Verify driver exists
            try {
                DriverClient.Driver driver = driverClient.getDriver(driverId);
                if (driver == null) {
                    throw new NoSuchElementException("Driver not found in Driver Service");
                }
            } catch (Exception e) {
                throw new RuntimeException("Failed to verify driver: " + e.getMessage());
            }
        }

        vehicle.setAssignedDriverId(driverId);
        // Maybe update status to "ON_MISSION" or "ASSIGNED"?
        // For now just set driver.
        return vehicleRepository.save(vehicle);
    }

    public List<Vehicle> getAvailableVehicles(String type) {
        return vehicleRepository.findByTypeAndStatus(type, "AVAILABLE");
    }

    public Optional<Vehicle> getVehicleByPlate(String plate) {
        return vehicleRepository.findByPlate(plate);
    }

    public void updateVehicleStatus(String id, String status) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Vehicle not found"));
        vehicle.setStatus(status);
        vehicleRepository.save(vehicle);
    }
}
