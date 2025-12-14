package com.ishika.driver.service;

import com.ishika.driver.domain.Driver;
import com.ishika.driver.repo.DriverRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DriverServiceTest {

    @Mock
    private DriverRepository driverRepository;

    @InjectMocks
    private DriverService driverService;

    @Test
    public void testRegisterDriver_Success() {
        Driver driver = new Driver();
        driver.setName("Jane Doe");
        driver.setLicenseClass("Heavy");
        driver.setAvailability(true);

        when(driverRepository.save(any(Driver.class))).thenAnswer(invocation -> {
            Driver saved = invocation.getArgument(0);
            saved.setId("d1");
            return saved;
        });

        Driver savedDriver = driverService.createDriver(driver);

        assertNotNull(savedDriver.getId());
        assertEquals("Jane Doe", savedDriver.getName());
        assertTrue(savedDriver.getAvailability()); // Default true?
        verify(driverRepository).save(any(Driver.class));
    }

    @Test
    public void testUpdateAvailabilityStatus() {
        Driver driver = new Driver();
        driver.setId("d1");
        driver.setAvailability(true);
        driver.setStatus("AVAILABLE");

        when(driverRepository.findById("d1")).thenReturn(Optional.of(driver));
        when(driverRepository.save(any(Driver.class))).thenReturn(driver);

        driverService.updateAvailability("d1", false);

        assertFalse(driver.getAvailability());
        assertEquals("BUSY", driver.getStatus());
        verify(driverRepository).save(driver);
    }
}
