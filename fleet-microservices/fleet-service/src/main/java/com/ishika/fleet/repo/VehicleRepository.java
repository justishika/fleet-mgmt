package com.ishika.fleet.repo;

import com.ishika.fleet.domain.Vehicle;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface VehicleRepository extends MongoRepository<Vehicle, String> {
    List<Vehicle> findByTypeAndStatus(String type, String status);

    java.util.Optional<Vehicle> findByPlate(String plate);
}
