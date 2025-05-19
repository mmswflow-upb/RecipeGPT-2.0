package com.example.recipegpt2_server.model;

import java.util.List;

/**
 * Model class for adding recipes to a user's saved recipes list.
 */
public class AddSavedRecipesRequest {
    private List<String> recipeIds;
    
    // Default constructor
    public AddSavedRecipesRequest() { }
    
    // Getters and setters
    public List<String> getRecipeIds() {
        return recipeIds;
    }
    
    public void setRecipeIds(List<String> recipeIds) {
        this.recipeIds = recipeIds;
    }
} 