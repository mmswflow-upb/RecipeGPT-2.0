package com.example.recipegpt2_server.model;

import com.google.cloud.firestore.DocumentReference;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Model class representing a Recipe.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Recipe {
    // Document ID when stored in Firestore
    private String id;

    // Basic recipe information
    private String title;
    private String description;
    private List<String> categories;
    private List<String> ingredients;
    private List<String> instructions;
    private int estimatedCookingTime;
    private int estimatedPrepTime;
    private int servings;

    // Recipe ownership and visibility
    private String userId;
    private boolean isPublic;

    // Additional properties
    private String image;
    private double rating;
    private int numOfRatings;
    private double totalSumRatings;
    private Map<String, Double> ratingList;
    private Double userRating;

    /**
     * Converts the Recipe object to a Map for Firestore storage
     * 
     * @return Map representation of the Recipe
     */
    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();

        // Basic recipe information
        map.put("title", title);
        map.put("description", description);
        map.put("categories", categories != null ? categories : new ArrayList<>());
        map.put("ingredients", ingredients != null ? ingredients : new ArrayList<>());
        map.put("instructions", instructions != null ? instructions : new ArrayList<>());

        // Only include timing fields if they are greater than 0
        if (estimatedCookingTime > 0) {
            map.put("estimatedCookingTime", estimatedCookingTime);
        }
        if (estimatedPrepTime > 0) {
            map.put("estimatedPrepTime", estimatedPrepTime);
        }
        map.put("servings", servings);

        // Recipe ownership and visibility
        if (userId != null) {
            map.put("userId", userId);
        }
        map.put("public", isPublic);

        // Additional properties
        map.put("image", image != null ? image : "");
        map.put("rating", rating);
        map.put("numOfRatings", numOfRatings);
        map.put("totalSumRatings", totalSumRatings);
        map.put("ratingList", ratingList != null ? ratingList : new HashMap<>());
        if (userRating != null) {
            map.put("userRating", userRating);
        }

        return map;
    }

    /**
     * Creates a Recipe object from a Firestore document map
     * 
     * @param map Map containing recipe data from Firestore
     * @param id  The document ID
     * @return Recipe object
     */
    public static Recipe fromMap(Map<String, Object> map, String id) {
        Recipe recipe = new Recipe();
        recipe.setId(id);

        // Basic recipe information
        recipe.setTitle((String) map.getOrDefault("title", ""));
        recipe.setDescription((String) map.getOrDefault("description", ""));
        recipe.setCategories((List<String>) map.getOrDefault("categories", new ArrayList<>()));
        recipe.setIngredients((List<String>) map.getOrDefault("ingredients", new ArrayList<>()));
        recipe.setInstructions((List<String>) map.getOrDefault("instructions", new ArrayList<>()));

        // Handle numeric fields with type safety
        Object cookingTimeObj = map.get("estimatedCookingTime");
        if (cookingTimeObj instanceof Integer) {
            recipe.setEstimatedCookingTime((Integer) cookingTimeObj);
        } else if (cookingTimeObj instanceof Long) {
            recipe.setEstimatedCookingTime(((Long) cookingTimeObj).intValue());
        }

        Object prepTimeObj = map.get("estimatedPrepTime");
        if (prepTimeObj instanceof Integer) {
            recipe.setEstimatedPrepTime((Integer) prepTimeObj);
        } else if (prepTimeObj instanceof Long) {
            recipe.setEstimatedPrepTime(((Long) prepTimeObj).intValue());
        }

        Object servingsObj = map.get("servings");
        if (servingsObj instanceof Integer) {
            recipe.setServings((Integer) servingsObj);
        } else if (servingsObj instanceof Long) {
            recipe.setServings(((Long) servingsObj).intValue());
        }

        // Recipe ownership and visibility
        recipe.setUserId((String) map.getOrDefault("userId", null));
        recipe.setPublic((Boolean) map.getOrDefault("public", false));

        // Additional properties
        recipe.setImage((String) map.getOrDefault("image", ""));

        // Handle rating fields
        Object ratingObj = map.get("rating");
        if (ratingObj instanceof Number) {
            recipe.setRating(((Number) ratingObj).doubleValue());
        }

        Object numOfRatingsObj = map.get("numOfRatings");
        if (numOfRatingsObj instanceof Number) {
            recipe.setNumOfRatings(((Number) numOfRatingsObj).intValue());
        }

        Object totalSumRatingsObj = map.get("totalSumRatings");
        if (totalSumRatingsObj instanceof Number) {
            recipe.setTotalSumRatings(((Number) totalSumRatingsObj).doubleValue());
        }

        // Handle ratingList
        Object ratingListObj = map.get("ratingList");
        if (ratingListObj instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Double> ratingList = (Map<String, Double>) ratingListObj;
            recipe.setRatingList(ratingList);
        } else {
            recipe.setRatingList(new HashMap<>());
        }

        // Handle userRating
        Object userRatingObj = map.get("userRating");
        if (userRatingObj instanceof Number) {
            recipe.setUserRating(((Number) userRatingObj).doubleValue());
        }

        return recipe;
    }
}