package com.ishika.dispatch.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Document(collection = "jobs")
public class Job {
    @Id
    private String id;
    private String pickup;
    private List<Stop> stops = new ArrayList<>();
    private String destination;
    private JobStatus status;
    private String vehicleId;
    private String driverId;
    private LocalDateTime createdAt = LocalDateTime.now();

    // Nested class for Stop
    public static class Stop {
        private String name;
        private LocalDateTime reachedAt;

        public Stop() {
        }

        public Stop(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public LocalDateTime getReachedAt() {
            return reachedAt;
        }

        public void setReachedAt(LocalDateTime reachedAt) {
            this.reachedAt = reachedAt;
        }
    }

    public enum JobStatus {
        PENDING, IN_PROGRESS, COMPLETED, CANCELLED, NEEDS_ATTENTION
    }

    public Job() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPickup() {
        return pickup;
    }

    public void setPickup(String pickup) {
        this.pickup = pickup;
    }

    public List<Stop> getStops() {
        return stops;
    }

    public void setStops(List<Stop> stops) {
        this.stops = stops;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public JobStatus getStatus() {
        return status;
    }

    public void setStatus(JobStatus status) {
        this.status = status;
    }

    public String getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(String vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getDriverId() {
        return driverId;
    }

    public void setDriverId(String driverId) {
        this.driverId = driverId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
