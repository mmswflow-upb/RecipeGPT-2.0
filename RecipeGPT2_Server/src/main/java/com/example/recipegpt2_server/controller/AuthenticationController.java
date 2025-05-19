package com.example.recipegpt2_server.controller;

import com.example.recipegpt2_server.model.LoginRequest;
import com.example.recipegpt2_server.model.User;
import com.example.recipegpt2_server.service.JwtService;
import com.example.recipegpt2_server.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserService userService;

    /**
     * Login endpoint.
     * Clients send an email and password, and we authenticate with Spring Security.
     * If authentication succeeds, we generate a JWT token and return it in the response.
     *
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        try {
            // Authenticate the user with Spring Security
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            // Get the authenticated user
            User user = (User) authentication.getPrincipal();

            // Generate JWT token
            String token = jwtService.generateToken(user);

            // Build the response
            Map<String, Object> response = new HashMap<>();
            response.put("idToken", token);
            response.put("email", user.getEmail());
            response.put("username", user.getUsernameField());
            response.put("isPublisher", user.isPublisher());
            
            // Add new fields if they exist
            if (user.getProfile_pic() != null) {
                response.put("profile_pic", user.getProfile_pic());
            }
            if (user.getBio() != null) {
                response.put("bio", user.getBio());
            }
            if (user.getPreferences() != null) {
                response.put("preferences", user.getPreferences());
            }
            if (user.getSavedRecipes() != null) {
                response.put("savedRecipes", user.getSavedRecipes());
            }
            if (user.getCreatedRecipes() != null) {
                response.put("createdRecipes", user.getCreatedRecipes());
            }
            
            // Return success response
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Authentication error: " + e.getMessage());
        }
    }

    /**
     * Token validation endpoint.
     * Clients send a JWT token, and we check if it's valid and not expired.
     * 
     * POST /api/auth/validate-token
     */
    @PostMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            // Check if auth header is present and in the correct format
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Invalid Authorization header format");
            }

            // Extract token from header
            String token = authHeader.substring(7);
            
            // Try to extract the username to check token format
            String username = jwtService.extractUsername(token);
            if (username == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Invalid token format");
            }
            
            // Check if token is expired using the private method in JwtService
            boolean isExpired = jwtService.extractClaim(token, claims -> 
                    claims.getExpiration().before(new java.util.Date()));
            
            Map<String, Object> response = new HashMap<>();
            response.put("valid", !isExpired);
            response.put("username", username);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid token: " + e.getMessage());
        }
    }
}
