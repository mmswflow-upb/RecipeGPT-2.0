package com.example.recipegpt2_server.controller;

import com.example.recipegpt2_server.model.Recipe;
import com.example.recipegpt2_server.model.SaveRecipeMessage;
import com.example.recipegpt2_server.service.RecipeService;
import com.example.recipegpt2_server.service.TemporaryRecipeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
//import org.springframework.messaging.handler.annotation.SendToUser;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Controller
public class RecipeWebSocketController {

    @Autowired
    private TemporaryRecipeService temporaryRecipeService;
    
    @Autowired
    private RecipeService recipeService;

    /**
     * Client sends a SaveRecipeMessage to /app/saveRecipes.
     * We retrieve the batch, save the selected recipes to Firestore, then reply.
     */
    @MessageMapping("/saveRecipes")
    @SendToUser("/queue/recipesSaved")
    public String saveSelectedRecipes(SaveRecipeMessage message) throws Exception {
        System.out.println(">>> Received WebSocket message for batchId: " + message.getBatchId());

        // 1) Grab the batch
        var batch = temporaryRecipeService.getBatch(message.getBatchId());
        if (batch == null) {
            return "❌ Error: batchId not found: " + message.getBatchId();
        }

        // 2) Save each selected recipe
        int saved = 0;
        for (Integer idx : message.getSelectedIndices()) {
            if (idx >= 0 && idx < batch.size()) {
                Recipe recipe = batch.get(idx);
                
                // Set additional properties
                if (message.getUserId() != null && !message.getUserId().isEmpty()) {
                    recipe.setUserId(message.getUserId());
                }
                
                // Set image (if provided, otherwise empty string)
                String imageValue = (message.getImage() != null) ? message.getImage() : "";
                recipe.setImage(imageValue);
                
                // Set public status to false (default)
                recipe.setPublic(false);
                
                // Set rating to 0.0 (default)
                recipe.setRating(0.0);
                
                try {
                    // Save the recipe using RecipeService
                    Recipe savedRecipe = recipeService.saveRecipe(recipe);
                    
                    // Log the saved recipe
                    if (message.getUserId() != null && !message.getUserId().isEmpty()) {
                        System.out.println("✨ Saved recipe doc with ID: " + savedRecipe.getId() + " for user: " + message.getUserId());
                    } else {
                        System.out.println("✨ Saved recipe doc with ID: " + savedRecipe.getId() + " (no user ID provided)");
                    }
                    
                    saved++;
                } catch (ExecutionException | InterruptedException e) {
                    System.err.println("❌ Error saving recipe: " + e.getMessage());
                    e.printStackTrace();
                }
            }
        }

        // 3) (Optionally) clear out the temp batch
        temporaryRecipeService.removeBatch(message.getBatchId());

        // 4) Return success message
        return "✅ Successfully saved " + saved + " recipe(s) to Firestore.";
    }

//    @Autowired
//    private TemporaryRecipeService temporaryRecipeService;
//
//    private final ObjectMapper objectMapper = new ObjectMapper();
//
//    /**
//     * When a client sends a SaveRecipeMessage via WebSocket (to /app/saveRecipes),
//     * this method is called to persist the selected recipes in Firestore.
//     */
//    @MessageMapping("/saveRecipes")
//    @SendToUser("/queue/recipesSaved")  // The reply destination for that user
//    public String saveSelectedRecipes(SaveRecipeMessage message) throws Exception {
//        // Retrieve the batch from temporary storage
//        List<Map<String, Object>> recipeBatch = temporaryRecipeService.getBatch(message.getBatchId());
//        if (recipeBatch == null) {
//            return "Error: No temporary recipe batch found for batchId " + message.getBatchId();
//        }
//        // Select recipes based on provided indices
//        List<Map<String, Object>> selectedRecipes = new ArrayList<>();
//        for (Integer idx : message.getSelectedIndices()) {
//            if (idx >= 0 && idx < recipeBatch.size()) {
//                selectedRecipes.add(recipeBatch.get(idx));
//            }
//        }
//        // Save each selected recipe into Firestore (you might choose a different approach such as saving the batch as one document)
//        Firestore firestore = FirestoreClient.getFirestore();
//        for (Map<String, Object> recipe : selectedRecipes) {
//            firestore.collection("recipes").add(recipe).get(); // get() blocks until write completes; handle errors as needed
//        }
//        // Remove the temporary batch (or you could keep it for a while, depending on your application design)
//        temporaryRecipeService.removeBatch(message.getBatchId());
//
//        return "Successfully saved " + selectedRecipes.size() + " recipe(s) to Firestore.";
//    }


//    @MessageMapping("/saveRecipes")
//    @SendToUser("/queue/recipesSaved")
//    public String saveRaw(String rawMessage) {
//        System.out.println(">>> Received WebSocket message: " + rawMessage);
//        return "✅ Received and processed your request: " + rawMessage;
//    }




}
