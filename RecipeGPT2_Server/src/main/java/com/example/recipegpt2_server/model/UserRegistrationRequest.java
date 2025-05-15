package com.example.recipegpt2_server.model;

import java.util.List;

public class UserRegistrationRequest {
    private String email;
    private String password;
    private String username;
    private boolean publisher; // if true, this registration is for a publisher user
    private String profile_pic;
    private String bio;
    private List<String> preferences;
    private List<String> savedRecipes;
    private List<String> createdRecipes;

    // Constructors (optional), getters, and setters:

    public UserRegistrationRequest() { }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }
    public boolean isPublisher() {
        return publisher;
    }
    public void setPublisher(boolean publisher) {
        this.publisher = publisher;
    }
    public String getProfile_pic() {
        return profile_pic;
    }
    public void setProfile_pic(String profile_pic) {
        this.profile_pic = profile_pic;
    }
    public String getBio() {
        return bio;
    }
    public void setBio(String bio) {
        this.bio = bio;
    }
    public List<String> getPreferences() {
        return preferences;
    }
    public void setPreferences(List<String> preferences) {
        this.preferences = preferences;
    }
    public List<String> getSavedRecipes() {
        return savedRecipes;
    }
    public void setSavedRecipes(List<String> savedRecipes) {
        this.savedRecipes = savedRecipes;
    }
    public List<String> getCreatedRecipes() {
        return createdRecipes;
    }
    public void setCreatedRecipes(List<String> createdRecipes) {
        this.createdRecipes = createdRecipes;
    }
}
