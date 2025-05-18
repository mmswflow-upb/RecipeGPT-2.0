package com.example.recipegpt2_server.controller;

import com.example.recipegpt2_server.model.Recipe;
import com.example.recipegpt2_server.model.User;
import com.example.recipegpt2_server.service.RecipeService;
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
}
