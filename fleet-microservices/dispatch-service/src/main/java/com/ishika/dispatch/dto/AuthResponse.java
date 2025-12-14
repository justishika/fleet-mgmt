package com.ishika.dispatch.dto;

import com.ishika.dispatch.domain.Role;

public class AuthResponse {
    private String token;
    private Role role;
    private String driverId;

    public AuthResponse(String token, Role role, String driverId) {
        this.token = token;
        this.role = role;
        this.driverId = driverId;
    }

    public String getToken() {
        return token;
    }

    public Role getRole() {
        return role;
    }

    public String getDriverId() {
        return driverId;
    }
}
