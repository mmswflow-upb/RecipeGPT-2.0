package com.example.recipegpt2_server.controller;

import com.example.recipegpt2_server.model.User;
import com.example.recipegpt2_server.model.UserUpdateRequest;
import com.example.recipegpt2_server.model.SavedRecipesUpdateRequest;
import com.example.recipegpt2_server.model.DeleteSavedRecipesRequest;
import com.example.recipegpt2_server.service.JwtService;
import com.example.recipegpt2_server.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    /**
     * Update user profile endpoint.
     * Allows a user to update their own profile attributes (username, password, profile_pic, bio, preferences).
     * 
     * PUT /api/users/profile
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(@RequestBody UserUpdateRequest updateRequest) {
        try {
            // Get the authenticated user from the security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            // Update the user profile
            User updatedUser = userService.updateUser(currentUser.getEmail(), updateRequest);
            
            // Generate new JWT token with the updated user data
            String newToken = jwtService.generateToken(updatedUser);
            
            // Build the response
            Map<String, Object> response = new HashMap<>();
            response.put("idToken", newToken);
            response.put("email", updatedUser.getEmail());
            response.put("username", updatedUser.getUsernameField());
            response.put("isPublisher", updatedUser.isPublisher());
            
            // Add updated fields
            if (updatedUser.getProfile_pic() != null) {
                response.put("profile_pic", updatedUser.getProfile_pic());
            }
            if (updatedUser.getBio() != null) {
                response.put("bio", updatedUser.getBio());
            }
            if (updatedUser.getPreferences() != null) {
                response.put("preferences", updatedUser.getPreferences());
            }
            if (updatedUser.getSavedRecipes() != null) {
                response.put("savedRecipes", updatedUser.getSavedRecipes());
            }
            if (updatedUser.getCreatedRecipes() != null) {
                response.put("createdRecipes", updatedUser.getCreatedRecipes());
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating user profile: " + e.getMessage());
        }
    }
    
    /**
     * Update user's saved recipes endpoint.
     * Allows a user to update only their saved recipes list.
     * All recipes must be valid (exist and not belong to the current user).
     * If any recipe is invalid, the entire update is rejected.
     * 
     * PUT /api/users/saved-recipes
     */
    @PutMapping("/saved-recipes")
    public ResponseEntity<?> updateSavedRecipes(@RequestBody SavedRecipesUpdateRequest updateRequest) {
        try {
            // Get the authenticated user from the security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            // Update the user's saved recipes - this will throw an IllegalArgumentException if any recipe is invalid
            User updatedUser = userService.updateSavedRecipes(currentUser.getEmail(), updateRequest);
            
            // Generate new JWT token with the updated user data
            String newToken = jwtService.generateToken(updatedUser);
            
            // Build the response
            Map<String, Object> response = new HashMap<>();
            response.put("idToken", newToken);
            response.put("email", updatedUser.getEmail());
            response.put("username", updatedUser.getUsernameField());
            response.put("isPublisher", updatedUser.isPublisher());
            
            // Add fields that should always be in the response
            if (updatedUser.getProfile_pic() != null) {
                response.put("profile_pic", updatedUser.getProfile_pic());
            }
            if (updatedUser.getBio() != null) {
                response.put("bio", updatedUser.getBio());
            }
            if (updatedUser.getPreferences() != null) {
                response.put("preferences", updatedUser.getPreferences());
            }
            
            // Always include savedRecipes since this endpoint specifically updates them
            response.put("savedRecipes", updatedUser.getSavedRecipes());
            response.put("message", "Saved recipes updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            // This is thrown when any recipe validation fails
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating saved recipes: " + e.getMessage());
        }
    }

    /**
     * Delete specified recipe IDs from the user's savedRecipes list.
     * All recipe IDs must exist in the database for the operation to proceed.
     * 
     * POST /api/users/delete-saved-recipes
     */
    @PostMapping("/delete-saved-recipes")
    public ResponseEntity<?> deleteSavedRecipes(@RequestBody DeleteSavedRecipesRequest deleteRequest) {
        try {
            // Get the authenticated user from the security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            // Delete the specified recipe IDs from user's savedRecipes
            User updatedUser = userService.deleteSavedRecipes(currentUser.getEmail(), deleteRequest);
            
            // Generate new JWT token with the updated user data
            String newToken = jwtService.generateToken(updatedUser);
            
            // Build the response
            Map<String, Object> response = new HashMap<>();
            response.put("idToken", newToken);
            response.put("email", updatedUser.getEmail());
            response.put("username", updatedUser.getUsernameField());
            response.put("isPublisher", updatedUser.isPublisher());
            
            // Add fields that should always be in the response
            if (updatedUser.getProfile_pic() != null) {
                response.put("profile_pic", updatedUser.getProfile_pic());
            }
            if (updatedUser.getBio() != null) {
                response.put("bio", updatedUser.getBio());
            }
            if (updatedUser.getPreferences() != null) {
                response.put("preferences", updatedUser.getPreferences());
            }
            if (updatedUser.getCreatedRecipes() != null) {
                response.put("createdRecipes", updatedUser.getCreatedRecipes());
            }
            
            // Always include savedRecipes since this endpoint specifically updates them
            response.put("savedRecipes", updatedUser.getSavedRecipes());
            response.put("message", "Selected recipes removed from saved recipes successfully");
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            // This is thrown when any recipe validation fails
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting saved recipes: " + e.getMessage());
        }
    }
} 