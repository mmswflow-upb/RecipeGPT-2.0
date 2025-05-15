package com.example.recipegpt2_server.repository;

import com.example.recipegpt2_server.model.Recipe;
import com.example.recipegpt2_server.model.User;
import com.example.recipegpt2_server.service.JwtService;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Repository
public class RecipeRepository {

    private static final String RECIPES_COLLECTION = "recipes";
    private static final String USERS_COLLECTION = "users";

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Fetches public recipes that match the specified category and text filters
     * 
     * @param category Category to filter recipes by
     * @param text Text to search for in title, ingredients, and instructions
     * @return List of matching recipes
     */
    public List<Recipe> fetchPublicRecipes(String category, String text) throws ExecutionException, InterruptedException {
        Firestore firestore = FirestoreClient.getFirestore();
        List<Recipe> matchingRecipes = new ArrayList<>();
        
        // Query for public recipes only
        var querySnapshot = firestore.collection(RECIPES_COLLECTION)
                .whereEqualTo("public", true)
                .get()
                .get();
        
        // Filter the results by category and text
        for (QueryDocumentSnapshot document : querySnapshot.getDocuments()) {
            Recipe recipe = Recipe.fromMap(document.getData(), document.getId());
            
            // Check if recipe has the matching category
            if (!hasMatchingCategory(recipe, category)) {
                continue; // Skip this recipe if no matching category
            }
            
            // If category matches, check if text matches any of title, ingredients, or instructions
            if (matchesText(recipe, text)) {
                matchingRecipes.add(recipe);
            }
        }
        
        return matchingRecipes;
    }
    
    /**
     * Fetches saved recipes and user's own recipes that match the specified category and text filters
     * 
     * @param jwtToken JWT token to identify the user
     * @param category Category to filter recipes by
     * @param text Text to search for in title, ingredients, and instructions
     * @return List of matching recipes
     */
    public List<Recipe> fetchCreatedAndSavedRecipes(String jwtToken, String category, String text) 
            throws ExecutionException, InterruptedException {
        // Extract user ID from JWT token
        String userEmail = jwtService.extractUsername(jwtToken);
        if (userEmail == null) {
            throw new IllegalArgumentException("Invalid JWT token");
        }
        
        // Get user with the email from token
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        List<String> savedRecipeIds = user.getSavedRecipes();
        List<String> createdRecipeIds = user.getCreatedRecipes();
        
        Firestore firestore = FirestoreClient.getFirestore();
        List<Recipe> matchingRecipes = new ArrayList<>();
        
        // Get recipes created by the user using createdRecipes attribute
        if (createdRecipeIds != null && !createdRecipeIds.isEmpty()) {
            for (String recipeId : createdRecipeIds) {
                DocumentSnapshot document = firestore.collection(RECIPES_COLLECTION)
                        .document(recipeId)
                        .get()
                        .get();
                
                if (document.exists()) {
                    Recipe recipe = Recipe.fromMap(document.getData(), document.getId());
                    
                    // Check if recipe has the matching category
                    if (!hasMatchingCategory(recipe, category)) {
                        continue; // Skip this recipe if no matching category
                    }
                    
                    // If category matches, check if text matches any of title, ingredients, or instructions
                    if (matchesText(recipe, text)) {
                        matchingRecipes.add(recipe);
                    }
                }
            }
        }
        
        // Get recipes from the user's savedRecipes list
        if (savedRecipeIds != null && !savedRecipeIds.isEmpty()) {
            for (String recipeId : savedRecipeIds) {
                DocumentSnapshot document = firestore.collection(RECIPES_COLLECTION)
                        .document(recipeId)
                        .get()
                        .get();
                
                if (document.exists()) {
                    Recipe recipe = Recipe.fromMap(document.getData(), document.getId());
                    
                    // Check if recipe has the matching category
                    if (!hasMatchingCategory(recipe, category)) {
                        continue; // Skip this recipe if no matching category
                    }
                    
                    // If category matches, check if text matches any of title, ingredients, or instructions
                    if (matchesText(recipe, text)) {
                        // Avoid adding duplicates (in case a user's recipe is also in their savedRecipes)
                        if (!matchingRecipes.stream().anyMatch(r -> r.getId().equals(recipe.getId()))) {
                            matchingRecipes.add(recipe);
                        }
                    }
                }
            }
        }
        
        return matchingRecipes;
    }
    
    /**
     * Checks if a recipe has a category that matches or contains the provided category string
     * 
     * @param recipe Recipe to check
     * @param category Category string to match
     * @return true if a match is found, false otherwise
     */
    private boolean hasMatchingCategory(Recipe recipe, String category) {
        // If no category filter is provided or category is "all", consider it a match
        if (category == null || category.isEmpty() || "all".equalsIgnoreCase(category)) {
            return true;
        }
        
        if (recipe.getCategories() == null || recipe.getCategories().isEmpty()) {
            return false; // Recipe has no categories
        }
        
        // Check if any category contains the provided category string (case insensitive)
        String lowerCaseCategory = category.toLowerCase();
        return recipe.getCategories().stream()
                .anyMatch(cat -> cat.toLowerCase().contains(lowerCaseCategory));
    }
    
    /**
     * Checks if a recipe's title, ingredients, or instructions match or contain the provided text string
     * 
     * @param recipe Recipe to check
     * @param text Text string to match
     * @return true if a match is found, false otherwise
     */
    private boolean matchesText(Recipe recipe, String text) {
        if (text == null || text.isEmpty()) {
            return true; // If no text filter is provided, consider it a match
        }
        
        String lowerCaseText = text.toLowerCase();
        
        // Check title
        if (recipe.getTitle() != null && 
                recipe.getTitle().toLowerCase().contains(lowerCaseText)) {
            return true;
        }
        
        // Check ingredients
        if (recipe.getIngredients() != null) {
            for (String ingredient : recipe.getIngredients()) {
                if (ingredient.toLowerCase().contains(lowerCaseText)) {
                    return true;
                }
            }
        }
        
        // Check instructions
        if (recipe.getInstructions() != null) {
            for (String instruction : recipe.getInstructions()) {
                if (instruction.toLowerCase().contains(lowerCaseText)) {
                    return true;
                }
            }
        }
        
        return false; // No matches found
    }
} 