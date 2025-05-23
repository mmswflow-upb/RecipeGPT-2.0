package com.example.recipegpt2_server.controller;

import com.example.recipegpt2_server.model.Recipe;
import com.example.recipegpt2_server.repository.RecipeRepository;
import com.example.recipegpt2_server.repository.UserRepository;
import com.example.recipegpt2_server.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/recipes")
public class RecipeSearchController {

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Endpoint to fetch public recipes filtered by category and text
     * Requires authentication with JWT token in the Authorization header
     * 
     * @param authHeader Authorization header containing JWT token
     * @param category   Optional category filter
     * @param text       Optional text to search in title, ingredients, and
     *                   instructions
     * @return List of matching public recipes
     */
    @GetMapping("/public")
    public ResponseEntity<?> getPublicRecipes(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String text) {
        try {
            // Validate the token and get user ID
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authorization header with Bearer token is required");
            }

            String token = authHeader.substring(7);
            String userEmail = jwtService.extractUsername(token);
            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid JWT token");
            }

            // Get user ID
            String userId = null;
            java.util.Optional<com.example.recipegpt2_server.model.User> userOpt = userRepository
                    .findByEmail(userEmail);
            if (userOpt.isPresent()) {
                userId = userOpt.get().getId();
            }

            // Proceed with fetching public recipes, excluding user's own and saved recipes
            List<Recipe> recipes = recipeRepository.fetchPublicRecipes(userId, category, text);
            return ResponseEntity.ok(recipes);
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching public recipes: " + e.getMessage());
        }
    }

    /**
     * Endpoint to fetch saved recipes and user's own recipes filtered by category
     * and text
     * Requires authentication with JWT token in the Authorization header
     * 
     * @param authHeader Authorization header containing JWT token
     * @param category   Optional category filter
     * @param text       Optional text to search in title, ingredients, and
     *                   instructions
     * @return List of matching saved recipes and user's own recipes
     */
    @GetMapping("/saved")
    public ResponseEntity<?> getSavedRecipes(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String text) {
        try {
            // Extract token from Authorization header
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authorization header with Bearer token is required");
            }
            String token = authHeader.substring(7);
            // Extract user id from JWT
            String userEmail = jwtService.extractUsername(token);
            String userId = null;
            if (userEmail != null) {
                java.util.Optional<com.example.recipegpt2_server.model.User> userOpt = userRepository
                        .findByEmail(userEmail);
                if (userOpt.isPresent()) {
                    userId = userOpt.get().getId();
                }
            }
            List<Recipe> recipes = recipeRepository.fetchCreatedAndSavedRecipes(token, category, text);
            // Add isUserOwner attribute to each recipe
            List<Object> recipesWithOwner = new java.util.ArrayList<>();
            for (Recipe recipe : recipes) {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.putAll(recipe.toMap());
                map.put("id", recipe.getId());
                map.put("isUserOwner", userId != null && userId.equals(recipe.getUserId()));
                recipesWithOwner.add(map);
            }
            return ResponseEntity.ok(recipesWithOwner);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching saved recipes: " + e.getMessage());
        }
    }
}