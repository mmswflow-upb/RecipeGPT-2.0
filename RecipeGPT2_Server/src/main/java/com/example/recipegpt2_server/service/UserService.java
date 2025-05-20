package com.example.recipegpt2_server.service;

import com.example.recipegpt2_server.model.Recipe;
import com.example.recipegpt2_server.model.User;
import com.example.recipegpt2_server.model.UserRegistrationRequest;
import com.example.recipegpt2_server.model.UserUpdateRequest;
import com.example.recipegpt2_server.model.SavedRecipesUpdateRequest;
import com.example.recipegpt2_server.model.DeleteSavedRecipesRequest;
import com.example.recipegpt2_server.model.AddSavedRecipesRequest;
import com.example.recipegpt2_server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Autowired
    private RecipeService recipeService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        try {
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        } catch (ExecutionException | InterruptedException e) {
            throw new UsernameNotFoundException("Error loading user: " + e.getMessage(), e);
        }
    }

    public User registerUser(UserRegistrationRequest request) throws ExecutionException, InterruptedException {
        // Check if user already exists
        try {
            userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
                throw new RuntimeException("User already exists with email: " + request.getEmail());
            });
        } catch (UsernameNotFoundException ignored) {
            // This is expected if the user doesn't exist
        }

        // Create and save new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setPublisher(request.isPublisher());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // Encode password
        
        // Set profile_pic and bio, ensuring they're not null
        user.setProfile_pic(request.getProfile_pic() != null ? request.getProfile_pic() : "");
        user.setBio(request.getBio() != null ? request.getBio() : "");
        
        // Set preferences, ensuring it's not null
        user.setPreferences(request.getPreferences() != null ? request.getPreferences() : new ArrayList<>());
        
        // Set savedRecipes, ensuring it's not null
        user.setSavedRecipes(request.getSavedRecipes() != null ? request.getSavedRecipes() : new ArrayList<>());
        
        // Set createdRecipes, ensuring it's not null
        user.setCreatedRecipes(request.getCreatedRecipes() != null ? request.getCreatedRecipes() : new ArrayList<>());

        return userRepository.save(user);
    }
    
    /**
     * Update user attributes (name, password, profile_pic, bio, preferences)
     * @param email The email of the user to update
     * @param updateRequest The attributes to update
     * @return The updated user
     */
    public User updateUser(String email, UserUpdateRequest updateRequest) throws ExecutionException, InterruptedException {
        User user = (User) loadUserByUsername(email);
        
        // Update only the fields that are provided in the request
        if (updateRequest.getUsername() != null) {
            user.setUsername(updateRequest.getUsername());
        }
        
        if (updateRequest.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(updateRequest.getPassword()));
        }
        
        if (updateRequest.getProfile_pic() != null) {
            user.setProfile_pic(updateRequest.getProfile_pic());
        }
        
        if (updateRequest.getBio() != null) {
            user.setBio(updateRequest.getBio());
        }
        
        if (updateRequest.getPreferences() != null) {
            user.setPreferences(updateRequest.getPreferences());
        }
        
        // Save the updated user
        return userRepository.save(user);
    }
    
    /**
     * Update a user's savedRecipes list
     * Validates all recipe IDs must:
     * 1. Exist in Firestore
     * 2. Don't belong to the current user (users can only save other users' recipes)
     * If any recipe fails validation, the entire update is rejected.
     * 
     * @param email The email of the user to update
     * @param updateRequest The savedRecipes list to set
     * @return The updated user
     * @throws IllegalArgumentException If any recipe in the list fails validation
     */
    public User updateSavedRecipes(String email, SavedRecipesUpdateRequest updateRequest) 
            throws ExecutionException, InterruptedException, IllegalArgumentException {
        User user = (User) loadUserByUsername(email);
        
        if (updateRequest.getSavedRecipes() == null) {
            // If null, set to empty list rather than null
            user.setSavedRecipes(new ArrayList<>());
        } else {
            // Validate all recipes first before updating
            List<String> invalidRecipes = new ArrayList<>();
            Map<String, String> invalidReasons = new HashMap<>();
            
            for (String recipeId : updateRequest.getSavedRecipes()) {
                try {
                    // Check if the recipe exists
                    Recipe recipe = recipeService.getRecipeById(recipeId);
                    
                    if (recipe == null) {
                        invalidRecipes.add(recipeId);
                        invalidReasons.put(recipeId, "Recipe does not exist");
                    } else if (recipe.getUserId().equals(user.getId())) {
                        // Check if the recipe belongs to the current user
                        invalidRecipes.add(recipeId);
                        invalidReasons.put(recipeId, "Cannot save your own recipe");
                    }
                } catch (Exception e) {
                    invalidRecipes.add(recipeId);
                    invalidReasons.put(recipeId, "Error checking recipe: " + e.getMessage());
                }
            }
            
            // If any recipes are invalid, reject the entire update
            if (!invalidRecipes.isEmpty()) {
                StringBuilder errorMsg = new StringBuilder("Cannot update savedRecipes. The following recipes are invalid: ");
                for (String invalidId : invalidRecipes) {
                    errorMsg.append("\n- Recipe ID: ").append(invalidId)
                           .append(", Reason: ").append(invalidReasons.get(invalidId));
                }
                throw new IllegalArgumentException(errorMsg.toString());
            }
            
            // All recipes are valid, proceed with the update
            user.setSavedRecipes(updateRequest.getSavedRecipes());
        }
        
        // Save the updated user
        return userRepository.save(user);
    }

    /**
     * Delete specified recipe IDs from a user's savedRecipes list.
     * All recipe IDs must exist in the database for the operation to proceed.
     * 
     * @param email The email of the user
     * @param deleteRequest The request containing recipe IDs to delete
     * @return The updated user
     * @throws IllegalArgumentException If any recipe ID doesn't exist
     */
    public User deleteSavedRecipes(String email, DeleteSavedRecipesRequest deleteRequest) 
            throws ExecutionException, InterruptedException, IllegalArgumentException {
        User user = (User) loadUserByUsername(email);
        
        if (deleteRequest.getRecipeIds() == null || deleteRequest.getRecipeIds().isEmpty()) {
            return user; // Nothing to do
        }
        
        // Validate that all recipe IDs exist
        List<String> nonExistentRecipeIds = new ArrayList<>();
        
        for (String recipeId : deleteRequest.getRecipeIds()) {
            try {
                // Check if the recipe exists
                Recipe recipe = recipeService.getRecipeById(recipeId);
                
                if (recipe == null) {
                    nonExistentRecipeIds.add(recipeId);
                }
            } catch (Exception e) {
                nonExistentRecipeIds.add(recipeId);
            }
        }
        
        // If any recipes don't exist, reject the entire operation
        if (!nonExistentRecipeIds.isEmpty()) {
            StringBuilder errorMsg = new StringBuilder("Cannot delete recipes from savedRecipes. The following recipe IDs don't exist: ");
            errorMsg.append(String.join(", ", nonExistentRecipeIds));
            throw new IllegalArgumentException(errorMsg.toString());
        }
        
        // All recipes exist, so remove them from savedRecipes
        List<String> currentSavedRecipes = user.getSavedRecipes();
        if (currentSavedRecipes != null) {
            currentSavedRecipes.removeAll(deleteRequest.getRecipeIds());
            user.setSavedRecipes(currentSavedRecipes);
        }
        
        // Save the updated user
        return userRepository.save(user);
    }

    /**
     * Add new recipe IDs to a user's savedRecipes list.
     * For each recipe ID:
     * 1. Check if it's already in the user's savedRecipes list
     * 2. If not, check if it exists in Firestore
     * 3. If it exists, add it to the user's savedRecipes list
     * 
     * This method follows an all-or-nothing approach: if any recipe cannot be added,
     * the entire operation fails and no recipes are added.
     * 
     * @param email The email of the user
     * @param addRequest The request containing recipe IDs to add
     * @return The updated user
     * @throws IllegalArgumentException If any recipe ID can't be added
     */
    public User addSavedRecipes(String email, AddSavedRecipesRequest addRequest) 
            throws ExecutionException, InterruptedException, IllegalArgumentException {
        User user = (User) loadUserByUsername(email);
        
        if (addRequest.getRecipeIds() == null || addRequest.getRecipeIds().isEmpty()) {
            return user; // Nothing to do
        }
        
        // Get current savedRecipes or initialize empty list
        List<String> currentSavedRecipes = user.getSavedRecipes();
        if (currentSavedRecipes == null) {
            currentSavedRecipes = new ArrayList<>();
        }
        
        // Maps to track issues with specific recipe IDs
        Map<String, String> failedRecipes = new HashMap<>();
        Map<String, String> alreadySavedRecipes = new HashMap<>();
        
        // List to store validated recipes that can be added
        List<String> validatedRecipes = new ArrayList<>();
        
        // First validate all recipes - if any can't be added, we won't add any
        for (String recipeId : addRequest.getRecipeIds()) {
            // Check if already in savedRecipes
            if (currentSavedRecipes.contains(recipeId)) {
                alreadySavedRecipes.put(recipeId, "Recipe is already in saved recipes");
                continue;
            }
            
            try {
                // Check if the recipe exists
                Recipe recipe = recipeService.getRecipeById(recipeId);
                
                if (recipe == null) {
                    failedRecipes.put(recipeId, "Recipe does not exist");
                } else if (recipe.getUserId().equals(user.getId())) {
                    // Cannot save your own recipe
                    failedRecipes.put(recipeId, "Cannot save your own recipe");
                } else {
                    // Recipe is valid and not already saved
                    validatedRecipes.add(recipeId);
                }
            } catch (Exception e) {
                failedRecipes.put(recipeId, "Error checking recipe: " + e.getMessage());
            }
        }
        
        // If any recipes can't be added, fail the entire operation
        if (!failedRecipes.isEmpty() || !alreadySavedRecipes.isEmpty()) {
            StringBuilder errorMsg = new StringBuilder("Cannot add recipes to savedRecipes list. The following issues were found:");
            
            // Add failed recipes to error message
            for (Map.Entry<String, String> entry : failedRecipes.entrySet()) {
                errorMsg.append("\n- Recipe ID: ").append(entry.getKey())
                       .append(", Reason: ").append(entry.getValue());
            }
            
            // Add already saved recipes to error message
            for (Map.Entry<String, String> entry : alreadySavedRecipes.entrySet()) {
                errorMsg.append("\n- Recipe ID: ").append(entry.getKey())
                       .append(", Reason: ").append(entry.getValue());
            }
            
            throw new IllegalArgumentException(errorMsg.toString());
        }
        
        // All recipes are valid and not already saved, add them
        currentSavedRecipes.addAll(validatedRecipes);
        user.setSavedRecipes(currentSavedRecipes);
        
        // Save the updated user
        return userRepository.save(user);
    }

    /**
     * Get a user by ID
     * 
     * @param userId The ID of the user to fetch
     * @return Optional containing the User if found, or empty if not found
     * @throws ExecutionException, InterruptedException If there's an error accessing Firestore
     */
    public Optional<User> getUserById(String userId) throws ExecutionException, InterruptedException {
        return userRepository.findById(userId);
    }
} 