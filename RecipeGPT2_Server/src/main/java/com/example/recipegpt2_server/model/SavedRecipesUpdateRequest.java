package com.example.recipegpt2_server.model;

import java.util.List;

/**
 * Model class for updating a user's saved recipes.
 */
public class SavedRecipesUpdateRequest {
    private List<String> savedRecipes;
    
    // Default constructor
    public SavedRecipesUpdateRequest() { }
    
    // Getters and setters
    public List<String> getSavedRecipes() {
        return savedRecipes;
    }
    
    public void setSavedRecipes(List<String> savedRecipes) {
        this.savedRecipes = savedRecipes;
    }
} 