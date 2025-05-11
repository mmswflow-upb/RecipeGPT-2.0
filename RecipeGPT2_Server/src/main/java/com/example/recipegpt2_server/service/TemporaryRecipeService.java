package com.example.recipegpt2_server.service;

import com.example.recipegpt2_server.model.Recipe;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class TemporaryRecipeService {

    // Map of batchId -> list of Recipe objects
    private final ConcurrentHashMap<String, List<Recipe>> recipeBatches = new ConcurrentHashMap<>();

    /**
     * Stores a batch of recipes and returns a batch ID
     * @param recipeMaps List of recipe maps from the API response
     * @return Batch ID for later retrieval
     */
    public String storeBatch(List<Map<String, Object>> recipeMaps) {
        // Convert Map<String, Object> to Recipe objects
        List<Recipe> recipes = recipeMaps.stream()
                .map(map -> Recipe.fromMap(map, null))
                .collect(Collectors.toList());
        
        String batchId = UUID.randomUUID().toString();
        recipeBatches.put(batchId, recipes);
        return batchId;
    }

    /**
     * Get a batch of recipes by ID
     * @param batchId The batch ID
     * @return List of Recipe objects or null if batch not found
     */
    public List<Recipe> getBatch(String batchId) {
        return recipeBatches.get(batchId);
    }
    
    /**
     * Get a batch of recipes as maps for backward compatibility
     * @param batchId The batch ID
     * @return List of recipe maps or null if batch not found
     */
    public List<Map<String, Object>> getBatchAsMaps(String batchId) {
        List<Recipe> recipes = recipeBatches.get(batchId);
        if (recipes == null) {
            return null;
        }
        
        return recipes.stream()
                .map(Recipe::toMap)
                .collect(Collectors.toList());
    }

    /**
     * Remove a batch of recipes by ID
     * @param batchId The batch ID
     */
    public void removeBatch(String batchId) {
        recipeBatches.remove(batchId);
    }
}
