package com.example.recipegpt2_server.model;

import java.util.List;

public class SaveRecipeMessage {
    private String batchId;
    private List<Integer> selectedIndices; // e.g., indices of the selected recipes in the temporary batch

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
}
