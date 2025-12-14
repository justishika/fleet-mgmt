package com.ishika.dispatch.repo;

import com.ishika.dispatch.domain.Job;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface JobRepository extends MongoRepository<Job, String> {
    List<Job> findByDriverId(String driverId);

    List<Job> findByStatus(Job.JobStatus status);
}
