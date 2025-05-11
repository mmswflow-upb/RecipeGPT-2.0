package com.example.recipegpt2_server.model;

import java.util.List;

public class SaveRecipeMessage {
    private String batchId;
    private List<Integer> selectedIndices; // e.g., indices of the selected recipes in the temporary batch
    private String userId; // ID of the user who is saving the recipe
    private String image; // URL or base64 string of recipe image

    public SaveRecipeMessage() {}

    public String getBatchId() {
        return batchId;
    }
    public void setBatchId(String batchId) {
        this.batchId = batchId;
    }
    public List<Integer> getSelectedIndices() {
        return selectedIndices;
    }
    public void setSelectedIndices(List<Integer> selectedIndices) {
        this.selectedIndices = selectedIndices;
    }
    public String getUserId() {
        return userId;
    }
    public void setUserId(String userId) {
        this.userId = userId;
    }
    public String getImage() {
        return image;
    }
    public void setImage(String image) {
        this.image = image;
    }
}
