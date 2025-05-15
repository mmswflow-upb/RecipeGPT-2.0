package com.example.recipegpt2_server.model;

import java.util.List;

/**
 * Model class for recipe update requests.
 * Note: userId is explicitly not included as it should not be changeable.
 */
public class RecipeUpdateRequest {
    private String title;
    private List<String> categories;
    private List<String> ingredients;
    private List<String> instructions;
    private Integer estimatedCookingTime;
    private Integer servings;
    private Boolean isPublic;
    private String image;
    
    // Default constructor
    public RecipeUpdateRequest() { }
    
    // Getters and setters
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public List<String> getCategories() {
        return categories;
    }
    
    public void setCategories(List<String> categories) {
        this.categories = categories;
    }
    
    public List<String> getIngredients() {
        return ingredients;
    }
    
    public void setIngredients(List<String> ingredients) {
        this.ingredients = ingredients;
    }
    
    public List<String> getInstructions() {
        return instructions;
    }
    
    public void setInstructions(List<String> instructions) {
        this.instructions = instructions;
    }
    
    public Integer getEstimatedCookingTime() {
        return estimatedCookingTime;
    }
    
    public void setEstimatedCookingTime(Integer estimatedCookingTime) {
        this.estimatedCookingTime = estimatedCookingTime;
    }
    
    public Integer getServings() {
        return servings;
    }
    
    public void setServings(Integer servings) {
        this.servings = servings;
    }
    
    public Boolean getIsPublic() {
        return isPublic;
    }
    
    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }
    
    public String getImage() {
        return image;
    }
    
    public void setImage(String image) {
        this.image = image;
    }
} 