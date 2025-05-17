package com.example.recipegpt2_server.controller;

import com.example.recipegpt2_server.model.Recipe;
import com.example.recipegpt2_server.model.RecipeUpdateRequest;
import com.example.recipegpt2_server.model.DeleteRecipesRequest;
import com.example.recipegpt2_server.model.User;
import com.example.recipegpt2_server.service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;

@RestController
@RequestMapping("/api/recipes")
public class RecipeEditorController {

    @Autowired
    private RecipeService recipeService;

    /**
     * Get all recipes created by the current user
     */
    @GetMapping("/my-recipes")
    public ResponseEntity<?> getMyRecipes() {
        try {
            // Get the authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();

            // Get recipes where userId matches current user's id
            List<Recipe> recipes = recipeService.getRecipesByUserId(currentUser.getId());

            return ResponseEntity.ok(recipes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching user recipes: " + e.getMessage());
        }
    }

    /**
     * Update a recipe owned by the current user
     * 
     * - All users can edit their own recipes
     * - Only publishers can edit the public attribute
     * - The userId attribute cannot be changed
     */
    @PutMapping("/{recipeId}")
    public ResponseEntity<?> updateRecipe(
            @PathVariable String recipeId,
            @RequestBody RecipeUpdateRequest updateRequest) {

        try {
            // Get the authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();

            // The updateRecipe method includes permission checks
            Recipe updatedRecipe = recipeService.updateRecipe(recipeId, updateRequest, currentUser);

            return ResponseEntity.ok(updatedRecipe);
        } catch (SecurityException e) {
            // User doesn't have permission to update this recipe
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Permission denied: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            // Recipe not found
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Recipe not found: " + e.getMessage());
        } catch (ExecutionException | InterruptedException e) {
            // Error during update
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating recipe: " + e.getMessage());
        }
    }

    /**
     * Delete a recipe owned by the current user
     * This will also:
     * - Remove the recipe ID from the creator's createdRecipes list
     * - Remove the recipe ID from the savedRecipes list of all users who saved it
     */
    @DeleteMapping("/{recipeId}")
    public ResponseEntity<?> deleteRecipe(@PathVariable String recipeId) {
        try {
            // Get the authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();

            // Get the recipe to check ownership
            Recipe recipe = recipeService.getRecipeById(recipeId);

            // If recipe doesn't exist
            if (recipe == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Recipe not found with ID: " + recipeId);
            }

            // Check if the user owns this recipe
            if (!recipe.getUserId().equals(currentUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You don't have permission to delete this recipe");
            }

            // Delete the recipe including cleanup of all related user references
            boolean deleted = recipeService.deleteRecipe(recipeId);

            if (deleted) {
                return ResponseEntity.ok(Map.of(
                        "message", "Recipe deleted successfully",
                        "recipeId", recipeId));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Recipe could not be deleted: not found with ID: " + recipeId);
            }
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting recipe: " + e.getMessage());
        }
    }

    /**
     * Delete multiple recipes owned by the current user
     * This will also:
     * - Remove the recipe IDs from the creator's createdRecipes list
     * - Remove the recipe IDs from the savedRecipes list of all users who saved
     * them
     * 
     * @param deleteRequest The request containing recipe IDs to delete
     * @return Map containing success and failure information
     */
    @PostMapping("/bulk-delete")
    public ResponseEntity<?> deleteRecipes(@RequestBody DeleteRecipesRequest deleteRequest) {
        try {
            // Get the authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();

            if (deleteRequest.getRecipeIds() == null || deleteRequest.getRecipeIds().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("No recipe IDs provided for deletion");
            }

            // Track results
            List<String> successfullyDeleted = new ArrayList<>();
            List<String> failedToDelete = new ArrayList<>();
            Map<String, String> failureReasons = new HashMap<>();

            // Process each recipe
            for (String recipeId : deleteRequest.getRecipeIds()) {
                try {
                    // Get the recipe to check ownership
                    Recipe recipe = recipeService.getRecipeById(recipeId);

                    // If recipe doesn't exist
                    if (recipe == null) {
                        failedToDelete.add(recipeId);
                        failureReasons.put(recipeId, "Recipe not found");
                        continue;
                    }

                    // Check if the user owns this recipe
                    if (!recipe.getUserId().equals(currentUser.getId())) {
                        failedToDelete.add(recipeId);
                        failureReasons.put(recipeId, "You don't have permission to delete this recipe");
                        continue;
                    }

                    // Delete the recipe including cleanup of all related user references
                    boolean deleted = recipeService.deleteRecipe(recipeId);

                    if (deleted) {
                        successfullyDeleted.add(recipeId);
                    } else {
                        failedToDelete.add(recipeId);
                        failureReasons.put(recipeId, "Failed to delete recipe");
                    }
                } catch (Exception e) {
                    failedToDelete.add(recipeId);
                    failureReasons.put(recipeId, "Error: " + e.getMessage());
                }
            }

            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("successfullyDeleted", successfullyDeleted);
            response.put("failedToDelete", failedToDelete);
            response.put("failureReasons", failureReasons);

            if (failedToDelete.isEmpty()) {
                response.put("message", "All recipes deleted successfully");
                return ResponseEntity.ok(response);
            } else if (successfullyDeleted.isEmpty()) {
                response.put("message", "Failed to delete any recipes");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            } else {
                response.put("message", "Some recipes were deleted successfully, while others failed");
                return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT).body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing bulk delete request: " + e.getMessage());
        }
    }
}