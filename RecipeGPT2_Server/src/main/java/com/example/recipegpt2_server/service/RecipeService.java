package com.example.recipegpt2_server.service;

import com.example.recipegpt2_server.model.Recipe;
import com.example.recipegpt2_server.model.RecipeUpdateRequest;
import com.example.recipegpt2_server.model.User;
import com.example.recipegpt2_server.repository.UserRepository;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

/**
 * Service class for handling recipe operations
 */
@Service
public class RecipeService {

    private static final String RECIPES_COLLECTION = "recipes";
    
    @Autowired
    private UserRepository userRepository;

    /**
     * Save a recipe to Firestore and update the user's createdRecipes list
     * @param recipe The recipe to save
     * @return The saved recipe with its Firestore document ID
     */
    public Recipe saveRecipe(Recipe recipe) throws ExecutionException, InterruptedException {
        Firestore firestore = FirestoreClient.getFirestore();
        Map<String, Object> recipeMap = recipe.toMap();
        
        var documentReference = firestore.collection(RECIPES_COLLECTION).add(recipeMap).get();
        recipe.setId(documentReference.getId());
        
        // Update user's createdRecipes list if userId is set
        if (recipe.getUserId() != null && !recipe.getUserId().isEmpty()) {
            // Find the user by ID
            try {
                // Get the user document directly by ID
                var userDoc = firestore.collection("users")
                        .document(recipe.getUserId())
                        .get()
                        .get();
                
                if (userDoc.exists()) {
                    // Get current createdRecipes or initialize empty list
                    List<String> createdRecipes = (List<String>) userDoc.get("createdRecipes");
                    if (createdRecipes == null) {
                        createdRecipes = new ArrayList<>();
                    }
                    
                    // Add the new recipe ID if it's not already in the list
                    if (!createdRecipes.contains(recipe.getId())) {
                        createdRecipes.add(recipe.getId());
                        
                        // Update the user document
                        firestore.collection("users")
                                .document(recipe.getUserId())
                                .update("createdRecipes", createdRecipes)
                                .get();
                        
                        System.out.println("✨ Added recipe " + recipe.getId() + " to user's createdRecipes list");
                    }
                } else {
                    System.err.println("❌ User not found with ID: " + recipe.getUserId());
                }
            } catch (Exception e) {
                System.err.println("❌ Error updating user's createdRecipes: " + e.getMessage());
                e.printStackTrace();
                // Continue execution even if updating user's createdRecipes fails
            }
        }
        
        return recipe;
    }
    
    /**
     * Get a recipe by its document ID
     * @param recipeId The Firestore document ID
     * @return The recipe, or null if not found
     */
    public Recipe getRecipeById(String recipeId) throws ExecutionException, InterruptedException {
        Firestore firestore = FirestoreClient.getFirestore();
        DocumentSnapshot document = firestore.collection(RECIPES_COLLECTION).document(recipeId).get().get();
        
        if (document.exists()) {
            return Recipe.fromMap(document.getData(), document.getId());
        }
        
        return null;
    }
    
    /**
     * Get all recipes for a specific user
     * @param userId The user ID
     * @return List of user's recipes
     */
    public List<Recipe> getRecipesByUserId(String userId) throws ExecutionException, InterruptedException {
        Firestore firestore = FirestoreClient.getFirestore();
        List<Recipe> recipes = new ArrayList<>();
        
        var querySnapshot = firestore.collection(RECIPES_COLLECTION)
                .whereEqualTo("userId", userId)
                .get()
                .get();
        
        for (QueryDocumentSnapshot document : querySnapshot.getDocuments()) {
            Recipe recipe = Recipe.fromMap(document.getData(), document.getId());
            recipes.add(recipe);
        }
        
        return recipes;
    }
    
    /**
     * Get public recipes (recipes that have isPublic set to true)
     * @param limit Maximum number of recipes to retrieve
     * @return List of public recipes
     */
    public List<Recipe> getPublicRecipes(int limit) throws ExecutionException, InterruptedException {
        Firestore firestore = FirestoreClient.getFirestore();
        List<Recipe> recipes = new ArrayList<>();
        
        var querySnapshot = firestore.collection(RECIPES_COLLECTION)
                .whereEqualTo("public", true)
                .limit(limit)
                .get()
                .get();
        
        for (QueryDocumentSnapshot document : querySnapshot.getDocuments()) {
            Recipe recipe = Recipe.fromMap(document.getData(), document.getId());
            recipes.add(recipe);
        }
        
        return recipes;
    }
    
    /**
     * Update a recipe's public status
     * @param recipeId The recipe ID
     * @param isPublic New public status
     * @return Updated recipe
     */
    public Recipe updateRecipePublicStatus(String recipeId, boolean isPublic) throws ExecutionException, InterruptedException {
        Firestore firestore = FirestoreClient.getFirestore();
        firestore.collection(RECIPES_COLLECTION).document(recipeId).update("public", isPublic).get();
        
        return getRecipeById(recipeId);
    }
    
    /**
     * Update a recipe's rating
     * @param recipeId The recipe ID
     * @param rating New rating value (1.0 - 5.0)
     * @return Updated recipe
     */
    public Recipe updateRecipeRating(String recipeId, double rating) throws ExecutionException, InterruptedException {
        if (rating < 0.0 || rating > 5.0) {
            throw new IllegalArgumentException("Rating must be between 0.0 and 5.0");
        }
        
        Firestore firestore = FirestoreClient.getFirestore();
        firestore.collection(RECIPES_COLLECTION).document(recipeId).update("rating", rating).get();
        
        return getRecipeById(recipeId);
    }
    
    /**
     * Delete a recipe and perform the following cleanup:
     * 1. Remove it from the creator's createdRecipes list
     * 2. Remove it from the savedRecipes list of any users who saved it
     * 
     * @param recipeId The recipe ID to delete
     * @return True if deleted successfully
     */
    public boolean deleteRecipe(String recipeId) throws ExecutionException, InterruptedException {
        Firestore firestore = FirestoreClient.getFirestore();
        
        // Get the recipe to find the user ID
        Recipe recipe = getRecipeById(recipeId);
        if (recipe == null) {
            // Recipe doesn't exist, nothing to do
            return false;
        }
        
        // 1. If recipe has a userId, remove the recipe ID from the creator's createdRecipes list
        if (recipe.getUserId() != null) {
            try {
                // Get the user document
                var userDoc = firestore.collection("users")
                        .document(recipe.getUserId())
                        .get()
                        .get();
                
                if (userDoc.exists()) {
                    // Get current createdRecipes
                    List<String> createdRecipes = (List<String>) userDoc.get("createdRecipes");
                    if (createdRecipes != null && createdRecipes.contains(recipeId)) {
                        // Remove the recipe ID from the list
                        createdRecipes.remove(recipeId);
                        
                        // Update the user document
                        firestore.collection("users")
                                .document(recipe.getUserId())
                                .update("createdRecipes", createdRecipes)
                                .get();
                        
                        System.out.println("✨ Removed recipe " + recipeId + " from creator's createdRecipes list");
                    }
                }
            } catch (Exception e) {
                System.err.println("❌ Error updating creator's createdRecipes during recipe deletion: " + e.getMessage());
                // Continue with recipe deletion even if updating user's createdRecipes fails
            }
        }
        
        // 2. Remove the recipe ID from the savedRecipes list of all users who saved it
        try {
            // Get all users that have this recipe in their savedRecipes
            var usersWithSavedRecipe = firestore.collection("users")
                    .whereArrayContains("savedRecipes", recipeId)
                    .get()
                    .get();
            
            // Process each user document
            for (var userDoc : usersWithSavedRecipe.getDocuments()) {
                try {
                    // Get current savedRecipes
                    List<String> savedRecipes = (List<String>) userDoc.get("savedRecipes");
                    if (savedRecipes != null) {
                        // Remove the recipe ID
                        savedRecipes.remove(recipeId);
                        
                        // Update the user document
                        firestore.collection("users")
                                .document(userDoc.getId())
                                .update("savedRecipes", savedRecipes)
                                .get();
                        
                        System.out.println("✨ Removed recipe " + recipeId + " from user " + userDoc.getId() + "'s savedRecipes list");
                    }
                } catch (Exception e) {
                    System.err.println("❌ Error updating user " + userDoc.getId() + "'s savedRecipes: " + e.getMessage());
                    // Continue with other users even if updating this user fails
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error finding users with this recipe in savedRecipes: " + e.getMessage());
            // Continue with recipe deletion even if updating users' savedRecipes fails
        }
        
        // 3. Delete the recipe
        firestore.collection(RECIPES_COLLECTION).document(recipeId).delete().get();
        System.out.println("✨ Deleted recipe " + recipeId + " from Firestore");
        return true;
    }
    
    /**
     * Update a recipe with permission checks
     * @param recipeId The ID of the recipe to update
     * @param updateRequest The update request containing fields to update
     * @param currentUser The currently authenticated user
     * @return The updated recipe
     * @throws SecurityException If the user doesn't have permission to update this recipe
     */
    public Recipe updateRecipe(String recipeId, RecipeUpdateRequest updateRequest, User currentUser) 
            throws ExecutionException, InterruptedException, SecurityException {
        
        // Get the recipe
        Recipe existingRecipe = getRecipeById(recipeId);
        if (existingRecipe == null) {
            throw new IllegalArgumentException("Recipe not found with ID: " + recipeId);
        }
        
        // Check if the user owns this recipe
        if (!existingRecipe.getUserId().equals(currentUser.getId())) {
            throw new SecurityException("You do not have permission to update this recipe");
        }
        
        // Update the fields if they are provided
        Map<String, Object> updates = new HashMap<>();
        
        if (updateRequest.getTitle() != null) {
            updates.put("title", updateRequest.getTitle());
        }
        
        if (updateRequest.getCategories() != null) {
            updates.put("categories", updateRequest.getCategories());
        }
        
        if (updateRequest.getIngredients() != null) {
            updates.put("ingredients", updateRequest.getIngredients());
        }
        
        if (updateRequest.getInstructions() != null) {
            updates.put("instructions", updateRequest.getInstructions());
        }
        
        if (updateRequest.getEstimatedCookingTime() != null) {
            updates.put("estimatedCookingTime", updateRequest.getEstimatedCookingTime());
        }
        
        if (updateRequest.getServings() != null) {
            updates.put("servings", updateRequest.getServings());
        }
        
        if (updateRequest.getImage() != null) {
            updates.put("image", updateRequest.getImage());
        }
        
        // Special handling for isPublic attribute based on user role
        if (updateRequest.getIsPublic() != null) {
            // Only publishers can change the public attribute
            if (currentUser.isPublisher()) {
                updates.put("public", updateRequest.getIsPublic());
            } else {
                // For non-publishers, ignore the isPublic field
                System.out.println("Non-publisher user attempted to change recipe's public status - ignoring this field");
            }
        }
        
        // Update the recipe in Firestore if there are updates
        if (!updates.isEmpty()) {
            Firestore firestore = FirestoreClient.getFirestore();
            firestore.collection(RECIPES_COLLECTION)
                    .document(recipeId)
                    .update(updates)
                    .get();
        }
        
        // Return the updated recipe
        return getRecipeById(recipeId);
    }
} 