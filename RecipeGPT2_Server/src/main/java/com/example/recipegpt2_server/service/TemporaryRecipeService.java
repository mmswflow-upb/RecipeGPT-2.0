package com.example.recipegpt2_server.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TemporaryRecipeService {

    // Map of batchId -> list of recipe objects (each recipe is represented as a Map)
    private final ConcurrentHashMap<String, List<Map<String, Object>>> recipeBatches = new ConcurrentHashMap<>();

    public String storeBatch(List<Map<String, Object>> recipes) {
        String batchId = UUID.randomUUID().toString();
        recipeBatches.put(batchId, recipes);
        return batchId;
    }

    public List<Map<String, Object>> getBatch(String batchId) {
        return recipeBatches.get(batchId);
    }

    public void removeBatch(String batchId) {
        recipeBatches.remove(batchId);
    }
}
