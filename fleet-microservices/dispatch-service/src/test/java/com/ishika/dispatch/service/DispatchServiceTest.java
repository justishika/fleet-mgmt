package com.ishika.dispatch.service;

import com.ishika.dispatch.client.DriverClient;
import com.ishika.dispatch.client.FleetClient;
import com.ishika.dispatch.domain.Job;
import com.ishika.dispatch.repo.JobRepository;
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
public class DispatchServiceTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private FleetClient fleetClient;

    @Mock
    private DriverClient driverClient;

    @InjectMocks
    private DispatchService dispatchService;

    @Test
    public void testCreateJob_Success() {
        // Arrange
        Job job = new Job();
        job.setPickup("Loc A");
        job.setDestination("Loc B");

        FleetClient.Vehicle mockVehicle = new FleetClient.Vehicle();
        mockVehicle.setId("v1");
        mockVehicle.setPlate("ABC-123");

        DriverClient.Driver mockDriver = new DriverClient.Driver();
        mockDriver.setId("d1");
        mockDriver.setName("John Doe");

        when(fleetClient.getAvailableVehicle("Truck")).thenReturn(mockVehicle);
        when(driverClient.getAvailableDriver("Heavy")).thenReturn(mockDriver);
        when(jobRepository.save(any(Job.class))).thenAnswer(invocation -> {
            Job saved = invocation.getArgument(0);
            saved.setId("job1");
            return saved;
        });

        // Act
        Job createdJob = dispatchService.createJob(job);

        // Assert
        assertNotNull(createdJob.getId());
        assertEquals("v1", createdJob.getVehicleId());
        assertEquals("d1", createdJob.getDriverId());
        assertEquals(Job.JobStatus.IN_PROGRESS, createdJob.getStatus());

        verify(fleetClient).updateStatus("v1", "IN_TRANSIT");
        verify(driverClient).updateAvailability("d1", false);
    }
}
