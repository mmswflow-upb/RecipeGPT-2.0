package com.example.recipegpt2_server.service;

import com.example.recipegpt2_server.model.Recipe;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

/**
 * Service class for handling recipe operations
 */
@Service
public class RecipeService {

    private static final String RECIPES_COLLECTION = "recipes";

    /**
     * Save a recipe to Firestore
     * @param recipe The recipe to save
     * @return The saved recipe with its Firestore document ID
     */
    public Recipe saveRecipe(Recipe recipe) throws ExecutionException, InterruptedException {
        Firestore firestore = FirestoreClient.getFirestore();
        Map<String, Object> recipeMap = recipe.toMap();
        
        var documentReference = firestore.collection(RECIPES_COLLECTION).add(recipeMap).get();
        recipe.setId(documentReference.getId());
        
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
     * Delete a recipe
     * @param recipeId The recipe ID
     * @return True if deleted successfully
     */
    public boolean deleteRecipe(String recipeId) throws ExecutionException, InterruptedException {
        Firestore firestore = FirestoreClient.getFirestore();
        firestore.collection(RECIPES_COLLECTION).document(recipeId).delete().get();
        return true;
    }
} 