package com.ishika.dispatch.controller;

import com.ishika.dispatch.domain.Role;
import com.ishika.dispatch.domain.User;
import com.ishika.dispatch.dto.AuthRequest;
import com.ishika.dispatch.dto.AuthResponse;
import com.ishika.dispatch.repo.UserRepository;
import com.ishika.dispatch.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) throws Exception {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword()));
        } catch (BadCredentialsException e) {
            throw new Exception("Incorrect username or password", e);
        }

        final User user = userRepository.findByUsername(authRequest.getUsername()).orElseThrow();
        final String jwt = jwtUtil.generateToken(user.getUsername(), user.getRole(), user.getDriverId());

        return ResponseEntity.ok(new AuthResponse(jwt, user.getRole(), user.getDriverId()));
    }

    @PostMapping("/provision-driver")
    public ResponseEntity<?> provisionDriver(@RequestBody User driverUser) {
        User user = userRepository.findByUsername(driverUser.getUsername())
                .orElse(driverUser);

        // Update credentials even if they exist (handling re-provisioning/password
        // reset)
        user.setPasswordHash(passwordEncoder.encode(driverUser.getPasswordHash()));
        user.setRole(Role.DRIVER);
        user.setDriverId(driverUser.getDriverId());

        userRepository.save(user);
        return ResponseEntity.ok("Driver provisioned");
    }
}
