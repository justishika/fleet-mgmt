package com.ishika.driver.repo;

import com.ishika.driver.domain.Driver;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface DriverRepository extends MongoRepository<Driver, String> {
    List<Driver> findByLicenseClassAndAvailability(String licenseClass, boolean availability);
}
