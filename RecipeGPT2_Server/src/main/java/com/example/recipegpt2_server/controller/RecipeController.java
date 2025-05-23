package com.example.recipegpt2_server.controller;

import com.example.recipegpt2_server.model.Recipe;
import com.example.recipegpt2_server.model.User;
import com.example.recipegpt2_server.model.RecipeQueryRequest;
import com.example.recipegpt2_server.model.RecipeQueryResponse;
import com.example.recipegpt2_server.service.RecipeService;
import com.example.recipegpt2_server.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api") // Base URL
public class RecipeController {

        @Autowired
        private RecipeService recipeService;
        
        @Autowired
        private UserService userService;

        private final RestTemplate restTemplate = new RestTemplate();
        private final String openAiApiKey;
        private final String openAiApiUrl = "https://api.openai.com/v1/chat/completions";
        private final ObjectMapper objectMapper = new ObjectMapper(); // JSON Processor

        public RecipeController(@Value("${spring.ai.openai.api-key}") String openAiApiKey) {
                this.openAiApiKey = openAiApiKey;
        }

        // ----------------------
        // Endpoints
        // ----------------------

        /**
         * Modified getRecipes endpoint:
         * 1. Uses Spring Security for authentication.
         * 2. Generates recipes via OpenAI.
         * 3. Saves the recipes directly to Firestore.
         */
        @GetMapping("/getRecipes")
        public ResponseEntity<?> getRecipes(
                        @RequestParam String recipeQuery,
                        @RequestParam(defaultValue = "5") int numberOfRecipes) {

                // 1. Get the authenticated user from Spring Security context
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication == null || !authentication.isAuthenticated()) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                        .body("User not authenticated");
                }

                User user = (User) authentication.getPrincipal();

                // 2. Build the JSON schema and request body for recipes
                Map<String, Object> recipeSchema = buildRecipeSchema();
                Map<String, Object> requestBody = buildRequestBody(
                                "gpt-4o",
                                "You are a recipe generator. Respond with valid JSON format, without extra escaping or backslashes. Make sure appropriately categorize the recipes. "
                                                +
                                                "These are the categories, choose the ones that fit them best (individually), you can choose multiple ones from here BUT DONT CHOOSE ANYTHING BESIDES THESE!: Asian Cooking, Mediterranean Cooking, "
                                                +
                                                "Latin American Cooking, Middle Eastern & North African Cooking, Indian & South Asian Cooking, "
                                                +
                                                "European Continental Cooking, African Cooking, American Cooking, Vegetarian & Plant-Based, Vegan, Gluten-Free, "
                                                +
                                                "Low-Carb & Keto, Paleo & Whole30, Seafood & Pescatarian, Desserts & Baking, Breakfast & Brunch, Street Food & Snacks, Soups & Stews, Salads & Grain Bowls, Fusion & Modernist, Halal,"
                                                +
                                                "Beverages.",
                                "Generate " + numberOfRecipes + " recipes for '" + recipeQuery
                                                + "' strictly following the given schema.",
                                "multiple_recipes_schema",
                                recipeSchema);

                // 3. Call OpenAI API and parse the response
                ResponseEntity<?> openAiResponse = sendRequestToOpenAI(requestBody);

                // 4. Parse and save the recipes
                List<Recipe> savedRecipes = new ArrayList<>();
                if (openAiResponse.getBody() instanceof Map) {
                        Map<String, Object> responseMap = (Map<String, Object>) openAiResponse.getBody();
                        if (responseMap.containsKey("recipes")) {
                                Object recipesObj = responseMap.get("recipes");
                                if (recipesObj instanceof List) {
                                        List<Map<String, Object>> recipeMaps = (List<Map<String, Object>>) recipesObj;

                                        // Convert and save each recipe
                                        for (Map<String, Object> recipeMap : recipeMaps) {
                                                try {
                                                        Recipe recipe = Recipe.fromMap(recipeMap, null);
                                                        recipe.setUserId(user.getId()); // Set the user ID
                                                        recipe.setPublic(false); // Default to private
                                                        savedRecipes.add(recipeService.saveRecipe(recipe));
                                                } catch (Exception e) {
                                                        // Log error but continue with other recipes
                                                        System.err.println("Error saving recipe: " + e.getMessage());
                                                }
                                        }
                                } else {
                                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                                        .body("Invalid recipe format received from OpenAI");
                                }
                        } else {
                                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                                .body("No recipes found in OpenAI response");
                        }
                } else {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body("Invalid response format from OpenAI");
                }

                // Check if any recipes were saved
                if (savedRecipes.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body("Failed to save any recipes");
                }

                // 5. Return the saved recipes
                Map<String, Object> result = new HashMap<>();
                result.put("message", "Recipes generated and saved successfully");
                result.put("savedRecipeCount", savedRecipes.size());
                result.put("recipes", savedRecipes);
                return ResponseEntity.ok(result);
        }

        @GetMapping("/randomQuote")
        public ResponseEntity<?> getRandomQuote() {
                // 1) Build the JSON schema for quotes
                Map<String, Object> quoteSchema = buildQuoteSchema();

                // 2) Build request body
                Map<String, Object> requestBody = buildRequestBody(
                                "gpt-4o",
                                "You are a renowned chef and philosopher. Respond with valid JSON format, without extra escaping or backslashes.",
                                "Generate a random quote about cooking strictly following the given schema.",
                                "random_quote_schema",
                                quoteSchema);

                // 3) Send request & parse content
                return sendRequestToOpenAI(requestBody);
        }

        @PostMapping("/queryRecipe")
        public ResponseEntity<?> queryRecipe(@RequestBody RecipeQueryRequest queryRequest) {
                try {
                        // 1. Get the recipe based on the provided ID
                        Recipe recipe = recipeService.getRecipeById(queryRequest.getRecipeId());
                        if (recipe == null) {
                                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body("Recipe not found with ID: " + queryRequest.getRecipeId());
                        }

                        // 2. Convert the recipe to a structured format for GPT
                        String recipeFormat = formatRecipeForGpt(recipe);

                        // 3. Build the system message with instructions
                        String systemPrompt = "You are a helpful cooking assistant. "
                                + "You will be provided with a recipe, a user's request about that recipe, "
                                + "and a summary of previous conversation (if this isn't the first message). "
                                + "First read the recipe and analyze the conversation summary (if provided). "
                                + "Then respond helpfully to the user's request. "
                                + "After responding, create a comprehensive summary of the ENTIRE conversation, "
                                + "including all previous exchanges from the provided summary AND this new exchange. "
                                + "The summary should maintain the chronological flow of the entire conversation. "
                                + "Your response must be in JSON format with two fields: 'responseToUser' and 'summaryOfConvo'.";

                        // 4. Prepare the user message combining recipe, request and summary
                        String userMessage = "RECIPE:\n" + recipeFormat + "\n\n"
                                + "USER REQUEST:\n" + queryRequest.getUserRequest() + "\n\n"
                                + "CONVERSATION SUMMARY:\n" + (queryRequest.getConversationSummary() != null 
                                    && !queryRequest.getConversationSummary().isEmpty() 
                                    ? queryRequest.getConversationSummary() 
                                    : "This is the first message in this conversation.");

                        // 5. Create the schema for the response
                        Map<String, Object> responseSchema = buildRecipeQueryResponseSchema();

                        // 6. Build the request body
                        Map<String, Object> requestBody = buildRequestBody(
                                "gpt-4o",
                                systemPrompt,
                                userMessage,
                                "recipe_query_response_schema",
                                responseSchema
                        );

                        // 7. Send the request to OpenAI and handle the response
                        ResponseEntity<?> openAiResponse = sendRequestToOpenAI(requestBody);
                        
                        if (openAiResponse.getStatusCode() == HttpStatus.OK && openAiResponse.getBody() instanceof Map) {
                                Map<String, Object> responseMap = (Map<String, Object>) openAiResponse.getBody();
                                
                                if (responseMap.containsKey("responseToUser") && responseMap.containsKey("summaryOfConvo")) {
                                        RecipeQueryResponse response = new RecipeQueryResponse(
                                            (String) responseMap.get("responseToUser"),
                                            (String) responseMap.get("summaryOfConvo")
                                        );
                                        return ResponseEntity.ok(response);
                                } else {
                                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                                .body("Invalid response format from OpenAI. Missing required fields.");
                                }
                        }
                        
                        return openAiResponse;
                } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Error processing recipe query: " + e.getMessage());
                }
        }

        /**
         * Rate a recipe endpoint
         * Allows users to rate a recipe if:
         * 1. The recipe is public
         * 2. The user is not the creator of the recipe
         */
        @PostMapping("/rateRecipe")
        public ResponseEntity<?> rateRecipe(
                @RequestParam String recipeId,
                @RequestParam double rating) {
            
            try {
                // 1. Get the authenticated user from Spring Security context
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication == null || !authentication.isAuthenticated()) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body("User not authenticated");
                }
                
                User user = (User) authentication.getPrincipal();
                
                // 2. Add the rating to the recipe
                Recipe updatedRecipe = recipeService.addRatingToRecipe(recipeId, rating, user.getId());
                
                // 3. Return a success response
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Recipe rated successfully");
                response.put("recipe", updatedRecipe);
                return ResponseEntity.ok(response);
                
            } catch (SecurityException e) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(e.getMessage());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(e.getMessage());
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error rating recipe: " + e.getMessage());
            }
        }

        /**
         * Delete a rating from a recipe endpoint
         * Allows users to delete their own ratings from a recipe
         */
        @DeleteMapping("/deleteRating")
        public ResponseEntity<?> deleteRating(@RequestParam String recipeId) {
            
            try {
                // 1. Get the authenticated user from Spring Security context
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication == null || !authentication.isAuthenticated()) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body("User not authenticated");
                }
                
                User user = (User) authentication.getPrincipal();
                
                // 2. Delete the rating from the recipe
                Recipe updatedRecipe = recipeService.deleteRatingFromRecipe(recipeId, user.getId());
                
                // 3. Return a success response
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Rating deleted successfully");
                response.put("recipe", updatedRecipe);
                return ResponseEntity.ok(response);
                
            } catch (SecurityException e) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(e.getMessage());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(e.getMessage());
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error deleting rating: " + e.getMessage());
            }
        }

        /**
         * Fetch a publisher's profile based on user ID
         * Returns public information (username, email, bio, profile_pic, preferences) 
         * only if the user exists and is a publisher
         */
        @GetMapping("/fetchPublisherProfile")
        public ResponseEntity<?> fetchPublisherProfile(@RequestParam String userId) {
            try {
                // Get the user from repository by ID
                Optional<User> userOptional = userService.getUserById(userId);
                
                // Check if user exists
                if (userOptional.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("User not found with ID: " + userId);
                }
                
                User user = userOptional.get();
                
                // Check if user is a publisher
                if (!user.isPublisher()) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body("User with ID: " + userId + " is not a publisher");
                }
                
                // Return only public information
                Map<String, Object> publisherProfile = new HashMap<>();
                publisherProfile.put("username", user.getUsernameField());
                publisherProfile.put("email", user.getEmail());
                publisherProfile.put("bio", user.getBio());
                publisherProfile.put("profile_pic", user.getProfile_pic());
                publisherProfile.put("preferences", user.getPreferences());
                
                return ResponseEntity.ok(publisherProfile);
                
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error fetching publisher profile: " + e.getMessage());
            }
        }

        // ----------------------
        // Internal Methods
        // ----------------------

        /**
         * Builds the request body for OpenAI with a JSON schema.
         */
        private Map<String, Object> buildRequestBody(
                        String model,
                        String systemPromptText,
                        String userPromptText,
                        String schemaName,
                        Map<String, Object> schema) {
                // "messages" array
                List<Map<String, String>> messages = List.of(
                                Map.of("role", "system", "content", systemPromptText),
                                Map.of("role", "user", "content", userPromptText));

                // "response_format" with "json_schema"
                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("model", model);
                requestBody.put("messages", messages);
                requestBody.put("response_format", Map.of(
                                "type", "json_schema",
                                "json_schema", Map.of(
                                                "name", schemaName,
                                                "schema", schema)));

                return requestBody;
        }

        /**
         * JSON schema for multiple recipes.
         */
        private Map<String, Object> buildRecipeSchema() {
                // The "schema" field MUST include the entire object definition
                Map<String, Object> recipeSchema = new HashMap<>();
                recipeSchema.put("type", "object");
                recipeSchema.put("properties", Map.of(
                                "recipes", Map.of(
                                                "type", "array",
                                                "items", Map.of(
                                                                "type", "object",
                                                                "properties", Map.of(
                                                                                "title", Map.of("type", "string"),
                                                                                "description", Map.of("type", "string"),
                                                                                "categories",
                                                                                Map.of("type", "array", "items", Map
                                                                                                .of("type", "string")),
                                                                                "ingredients",
                                                                                Map.of("type", "array", "items", Map
                                                                                                .of("type", "string")),
                                                                                "instructions", Map.of(
                                                                                                "type", "array",
                                                                                                "items",
                                                                                                Map.of("type", "string")),
                                                                                "estimatedPrepTime", Map.of("type", "integer"),
                                                                                "estimatedCookingTime",
                                                                                Map.of("type", "integer"),

                                                                                "servings",
                                                                                Map.of("type", "integer"))))));
                return recipeSchema;
        }

        /**
         * JSON schema for a random quote.
         */
        private Map<String, Object> buildQuoteSchema() {
                Map<String, Object> quoteSchema = new HashMap<>();
                quoteSchema.put("type", "object");
                quoteSchema.put("properties", Map.of(
                                "quote", Map.of("type", "string")));
                return quoteSchema;
        }

        /**
         * Sends the request to OpenAI and returns only the parsed JSON from
         * message.content.
         */
        private ResponseEntity<?> sendRequestToOpenAI(Map<String, Object> requestBody) {
                try {
                        // Set up headers
                        HttpHeaders headers = new HttpHeaders();
                        headers.setContentType(MediaType.APPLICATION_JSON);
                        headers.setBearerAuth(openAiApiKey);

                        // Send the request
                        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
                        ResponseEntity<Map> response = restTemplate.exchange(
                                        openAiApiUrl,
                                        HttpMethod.POST,
                                        requestEntity,
                                        Map.class);

                        // Extract the content from the response
                        if (response.getBody() != null && response.getBody().containsKey("choices")) {
                                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody()
                                                .get("choices");
                                if (!choices.isEmpty()) {
                                        Map<String, Object> choice = choices.get(0);
                                        if (choice.containsKey("message")) {
                                                Map<String, String> message = (Map<String, String>) choice
                                                                .get("message");
                                                if (message.containsKey("content")) {
                                                        // Parse the content as JSON
                                                        String content = message.get("content");
                                                        Map<String, Object> parsedContent = objectMapper
                                                                        .readValue(content, Map.class);
                                                        return ResponseEntity.ok(parsedContent);
                                                }
                                        }
                                }
                        }

                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body("Failed to parse OpenAI response");
                } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body("Error calling OpenAI: " + e.getMessage());
                }
        }

        /**
         * Formats a recipe object into a readable text format for GPT
         */
        private String formatRecipeForGpt(Recipe recipe) {
                StringBuilder builder = new StringBuilder();
                
                builder.append("Title: ").append(recipe.getTitle()).append("\n\n");
                
                if (recipe.getDescription() != null && !recipe.getDescription().isEmpty()) {
                        builder.append("Description: ").append(recipe.getDescription()).append("\n\n");
                }
                
                if (recipe.getCategories() != null && !recipe.getCategories().isEmpty()) {
                        builder.append("Categories: ").append(String.join(", ", recipe.getCategories())).append("\n\n");
                }
                
                builder.append("Preparation Time: ").append(recipe.getEstimatedPrepTime()).append(" minutes\n");
                builder.append("Cooking Time: ").append(recipe.getEstimatedCookingTime()).append(" minutes\n");
                builder.append("Servings: ").append(recipe.getServings()).append("\n\n");
                
                if (recipe.getIngredients() != null && !recipe.getIngredients().isEmpty()) {
                        builder.append("Ingredients:\n");
                        for (String ingredient : recipe.getIngredients()) {
                                builder.append("- ").append(ingredient).append("\n");
                        }
                        builder.append("\n");
                }
                
                if (recipe.getInstructions() != null && !recipe.getInstructions().isEmpty()) {
                        builder.append("Instructions:\n");
                        for (int i = 0; i < recipe.getInstructions().size(); i++) {
                                builder.append(i + 1).append(". ").append(recipe.getInstructions().get(i)).append("\n");
                        }
                }
                
                return builder.toString();
        }

        /**
         * JSON schema for recipe query responses
         */
        private Map<String, Object> buildRecipeQueryResponseSchema() {
                Map<String, Object> schema = new HashMap<>();
                schema.put("type", "object");
                schema.put("properties", Map.of(
                        "responseToUser", Map.of("type", "string"),
                        "summaryOfConvo", Map.of("type", "string")
                ));
                schema.put("required", List.of("responseToUser", "summaryOfConvo"));
                return schema;
        }
}
