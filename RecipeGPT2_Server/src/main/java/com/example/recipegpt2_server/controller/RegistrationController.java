package com.example.recipegpt2_server.controller;

import com.example.recipegpt2_server.model.User;
import com.example.recipegpt2_server.model.UserRegistrationRequest;
import com.example.recipegpt2_server.service.JwtService;
import com.example.recipegpt2_server.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class RegistrationController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    /**
     * Endpoint for user registration.
     * This endpoint creates a new user using Spring Security and stores details in Firestore.
     * All users (both admins and regular users) are stored in the 'users' collection.
     *
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRegistrationRequest request) {
        try {
            // Register user with our service
            User user = userService.registerUser(request);
            
            // Generate a JWT token for the newly registered user
            String token = jwtService.generateToken(user);
            
            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("idToken", token);
            response.put("email", user.getEmail());
            response.put("username", user.getUsernameField());
            response.put("isPublisher", user.isPublisher());
            response.put("id", user.getId());
            
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
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error during registration: " + e.getMessage());
        }
    }
}
