package com.ishika.dispatch.controller;

import com.ishika.dispatch.domain.Job;
import com.ishika.dispatch.service.DispatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jobs")

public class JobController {

    @Autowired
    private DispatchService dispatchService;

    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody Job job) {
        try {
            return ResponseEntity.ok(dispatchService.createJob(job));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error creating job: " + e.getMessage());
        }
    }

    @GetMapping
    public List<Job> getAllJobs() {
        return dispatchService.getAllJobs();
    }

    @GetMapping("/{id}")
    public Job getJob(@PathVariable String id) {
        return dispatchService.getJobById(id);
    }

    @PutMapping("/{id}/mark-arrival")
    public void markArrival(@PathVariable String id) {
        dispatchService.markArrival(id);
    }

    @PutMapping("/{id}/mark-stop")
    public void markStop(@PathVariable String id, @RequestParam String stopName) {
        dispatchService.markStop(id, stopName);
    }

    @PostMapping("/{id}/emergency")
    public void emergency(@PathVariable String id) {
        dispatchService.raiseEmergency(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Job> updateJob(@PathVariable String id, @RequestBody Job job) {
        return ResponseEntity.ok(dispatchService.updateJob(id, job));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable String id) {
        dispatchService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }
}
