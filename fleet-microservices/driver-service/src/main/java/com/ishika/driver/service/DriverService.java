package com.ishika.driver.service;

import com.ishika.driver.client.AuthClient;
import com.ishika.driver.domain.Driver;
import com.ishika.driver.repo.DriverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class DriverService {

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private AuthClient authClient;

    public Driver createDriver(Driver driver) {
        // Save driver first
        Driver savedDriver = driverRepository.save(driver);

        // Create user in Auth Service
        // REMOVED: conflicting with frontend provisioning
        /*
         * try {
         * // Username = Name, Password = Vehicle Number (or ID if null)
         * String password = (driver.getAssignedVehicle() != null &&
         * !driver.getAssignedVehicle().isEmpty())
         * ? driver.getAssignedVehicle()
         * : "default123"; // Fallback if no vehicle assigned yet
         * 
         * // Normalize username (remove spaces or keep as is? User request said
         * "Driver's
         * // Name")
         * // I'll keep name as username for simplicity, but in real world better to
         * // normalize.
         * // "Driver Name" -> "Driver Name"
         * 
         * authClient.register(new AuthClient.RegisterRequest(
         * driver.getName(),
         * password,
         * "DRIVER",
         * savedDriver.getId()));
         * } catch (Exception e) {
         * // Log error but don't fail driver creation? Or fail?
         * // For now, let's log and proceed or throw.
         * // Better to fail if auth creation fails to keep consistency?
         * // But requirement said "system must automatically create", so if it fails,
         * // maybe we should rollback.
         * // Since we are distributed, rollback is hard without saga.
         * // I'll just print stack trace for now.
         * e.printStackTrace();
         * }
         */

        return savedDriver;
    }

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public Optional<Driver> getDriverById(String id) {
        return driverRepository.findById(id);
    }

    public Driver updateDriver(String id, Driver driver) {
        return driverRepository.findById(id).map(existing -> {
            if (driver.getName() != null)
                existing.setName(driver.getName());
            if (driver.getLicenseClass() != null)
                existing.setLicenseClass(driver.getLicenseClass());
            if (driver.getRating() != null)
                existing.setRating(driver.getRating());
            // Intentionally not updating status/location/availability here via general
            // update if null
            // as those have specific endpoints, but if provided we update them.
            if (driver.getStatus() != null)
                existing.setStatus(driver.getStatus());
            if (driver.getLocation() != null)
                existing.setLocation(driver.getLocation());
            if (driver.getDestination() != null)
                existing.setDestination(driver.getDestination());
            if (driver.getAssignedVehicle() != null)
                existing.setAssignedVehicle(driver.getAssignedVehicle());
            return driverRepository.save(existing);
        }).orElse(null);
    }

    public void deleteDriver(String id) {
        driverRepository.deleteById(id);
    }

    public List<Driver> getAvailableDrivers(String licenseClass) {
        return driverRepository.findByLicenseClassAndAvailability(licenseClass, true);
    }

    @Autowired
    private com.ishika.driver.client.FleetClient fleetClient;

    public void applyLeave(String id) {
        Driver driver = getDriverById(id).orElseThrow(() -> new java.util.NoSuchElementException("Driver not found"));
        driver.setAvailability(false);
        driver.setStatus("ON_LEAVE");
        driverRepository.save(driver);

        // Notify Fleet Service
        updateVehicleStatus(driver, "UNAVAILABLE");
    }

    public void raiseEmergency(String id) {
        Driver driver = getDriverById(id).orElseThrow(() -> new java.util.NoSuchElementException("Driver not found"));
        driver.setAvailability(false);
        driver.setStatus("EMERGENCY");
        driverRepository.save(driver);

        // Notify Fleet Service
        updateVehicleStatus(driver, "EMERGENCY");
    }

    public void updateLocation(String id, String location, String destination) {
        Driver driver = getDriverById(id).orElseThrow(() -> new java.util.NoSuchElementException("Driver not found"));
        if (location != null)
            driver.setLocation(location);
        if (destination != null)
            driver.setDestination(destination);
        driverRepository.save(driver);
    }

    public void updateAvailability(String id, boolean availability) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new java.util.NoSuchElementException("Driver not found"));
        driver.setAvailability(availability);
        if (availability) {
            driver.setStatus("AVAILABLE"); // Or ACTIVE
        } else {
            // Only set to BUSY if not already explicit status like ON_LEAVE or EMERGENCY?
            // Actually, if we are setting availability=false manually via this call (if
            // any),
            // we might want a default. But usually applyLeave/Emergency handles the false
            // cases.
            // This endpoint is mostly used for "Ready" (true).
            if (!"ON_LEAVE".equals(driver.getStatus()) && !"EMERGENCY".equals(driver.getStatus())) {
                driver.setStatus("BUSY");
            }
        }
        driverRepository.save(driver);
    }

    private void updateVehicleStatus(Driver driver, String status) {
        if (driver.getAssignedVehicle() != null && !driver.getAssignedVehicle().isEmpty()) {
            try {
                // Assuming assignedVehicle is Plate
                com.ishika.driver.client.FleetClient.Vehicle v = fleetClient
                        .getVehicleByPlate(driver.getAssignedVehicle());
                if (v != null) {
                    v.setStatus(status);
                    fleetClient.updateVehicle(v.getId(), v);
                }
            } catch (Exception e) {
                // Log error
                e.printStackTrace();
            }
        }
    }
}
