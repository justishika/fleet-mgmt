package com.ishika.dispatch.client;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.contract.wiremock.AutoConfigureWireMock;
import org.springframework.test.context.TestPropertySource;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@AutoConfigureWireMock(port = 0)
@TestPropertySource(properties = {
        "fleet.service.url=http://localhost:${wiremock.server.port}/vehicles",
        "driver.service.url=http://localhost:${wiremock.server.port}",
        "server.port=0",
        "spring.data.mongodb.uri=mongodb://localhost:27017/testdb" // Dummy URI to prevent connection errors if context
                                                                   // loads
})
public class FleetClientTest {

    @Autowired
    private FleetClient fleetClient;

    @org.springframework.boot.test.mock.mockito.MockBean
    private com.ishika.dispatch.repo.JobRepository jobRepository;

    @org.springframework.boot.test.mock.mockito.MockBean
    private com.ishika.dispatch.repo.UserRepository userRepository;

    @Test
    public void testGetAvailableVehicle_Success() {
        // Stub the WireMock server to return a specific JSON response
        stubFor(get(urlEqualTo("/vehicles/available?type=Truck"))
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withBody(
                                "{\"id\":\"v1\",\"plate\":\"MOCK-999\",\"type\":\"Truck\",\"status\":\"AVAILABLE\"}")));

        // Call the Feign client
        FleetClient.Vehicle vehicle = fleetClient.getAvailableVehicle("Truck");

        // Assertions
        assertThat(vehicle).isNotNull();
        assertThat(vehicle.getId()).isEqualTo("v1");
        assertThat(vehicle.getPlate()).isEqualTo("MOCK-999");
        assertThat(vehicle.getType()).isEqualTo("Truck");
    }
}
