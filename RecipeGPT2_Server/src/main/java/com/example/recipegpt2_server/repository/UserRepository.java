package com.example.recipegpt2_server.repository;

import com.example.recipegpt2_server.model.User;
import org.springframework.stereotype.Repository;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Repository
public class UserRepository {

    private static final String USERS_COLLECTION = "users";

    public User save(User user) throws ExecutionException, InterruptedException {
        Firestore firestore = FirestoreClient.getFirestore();
        
        // Convert user to a Map for Firestore
        Map<String, Object> userData = new HashMap<>();
        userData.put("email", user.getEmail());
        userData.put("username", user.getUsernameField());
        userData.put("password", user.getPassword());
        userData.put("publisher", user.isPublisher());
        
        // Always store these fields, even if empty
        userData.put("profile_pic", user.getProfile_pic());
        userData.put("bio", user.getBio());
        userData.put("preferences", user.getPreferences());
        userData.put("savedRecipes", user.getSavedRecipes());
        userData.put("createdRecipes", user.getCreatedRecipes());
        
        // If user doesn't have an ID, generate one from email
        if (user.getId() == null || user.getId().isEmpty()) {
            user.setId(user.getEmail().replaceAll("[^a-zA-Z0-9]", "_"));
        }
        
        // Save to Firestore users collection
        firestore.collection(USERS_COLLECTION)
                .document(user.getId())
                .set(userData)
                .get();
        
        return user;
    }
    
    public Optional<User> findByEmail(String email) throws ExecutionException, InterruptedException {
        Firestore firestore = FirestoreClient.getFirestore();
        
        // Check users collection
        var userDoc = firestore.collection(USERS_COLLECTION)
                .whereEqualTo("email", email)
                .limit(1)
                .get()
                .get();
        
        if (!userDoc.isEmpty()) {
            var doc = userDoc.getDocuments().get(0);
            User user = new User();
            user.setId(doc.getId());
            user.setEmail(doc.getString("email"));
            user.setUsername(doc.getString("username"));
            user.setPassword(doc.getString("password"));
            user.setPublisher(doc.getBoolean("publisher") != null ? doc.getBoolean("publisher") : false);
            
            // Get profile_pic and bio
            user.setProfile_pic(doc.getString("profile_pic") != null ? doc.getString("profile_pic") : "");
            user.setBio(doc.getString("bio") != null ? doc.getString("bio") : "");
            
            // Handle preferences list
            List<String> preferences = new ArrayList<>();
            if (doc.contains("preferences") && doc.get("preferences") != null) {
                preferences = (List<String>) doc.get("preferences");
            }
            user.setPreferences(preferences);
            
            // Handle savedRecipes list
            List<String> savedRecipes = new ArrayList<>();
            if (doc.contains("savedRecipes") && doc.get("savedRecipes") != null) {
                savedRecipes = (List<String>) doc.get("savedRecipes");
            }
            user.setSavedRecipes(savedRecipes);
            
            // Handle createdRecipes list
            List<String> createdRecipes = new ArrayList<>();
            if (doc.contains("createdRecipes") && doc.get("createdRecipes") != null) {
                createdRecipes = (List<String>) doc.get("createdRecipes");
            }
            user.setCreatedRecipes(createdRecipes);
            
            return Optional.of(user);
        }
        
        return Optional.empty();
    }
} 