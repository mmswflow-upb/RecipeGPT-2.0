package com.example.recipegpt2_server.model;

import java.util.List;

/**
 * Model class for requesting deletion of saved recipe IDs.
 */
public class DeleteSavedRecipesRequest {
    private List<String> recipeIds;
    
    // Default constructor
    public DeleteSavedRecipesRequest() { }
    
    // Getters and setters
    public List<String> getRecipeIds() {
        return recipeIds;
    }
    
    public void setRecipeIds(List<String> recipeIds) {
        this.recipeIds = recipeIds;
    }
} 