package com.example.recipegpt2_server.controller;

import com.example.recipegpt2_server.model.Recipe;
import com.example.recipegpt2_server.model.User;
import com.example.recipegpt2_server.service.TemporaryRecipeService;
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
    private TemporaryRecipeService temporaryRecipeService; // Inject our temporary storage service

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
     * 3. Stores the resulting recipes in temporary memory and returns a batchId.
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
                "You are a recipe generator. Respond with valid JSON format, without extra escaping or backslashes. Make sure appropriately categorize the recipes. " +
                        "These are the categories, choose the ones that fit them best (individually), you can choose multiple ones from here BUT DONT CHOOSE ANYTHING BESIDES THESE!: Asian Cooking, Mediterranean Cooking, " +
                        "Latin American Cooking, Middle Eastern & North African Cooking, Indian & South Asian Cooking, " +
                        "European Continental Cooking, African Cooking, American Cooking, Vegetarian & Plant-Based, Vegan, Gluten-Free, " +
                        "Low-Carb & Keto, Paleo & Whole30, Seafood & Pescatarian, Desserts & Baking, Breakfast & Brunch, Street Food & Snacks, Soups & Stews, Salads & Grain Bowls, Fusion & Modernist, Halal," +
                        "Beverages.",
                "Generate " + numberOfRecipes + " recipes for '" + recipeQuery
                        + "' strictly following the given schema.",
                "multiple_recipes_schema",
                recipeSchema);

        // 3. Call OpenAI API and parse the response
        ResponseEntity<?> openAiResponse = sendRequestToOpenAI(requestBody);

        // 4. Store recipes temporarily and generate a batchId
        List<Map<String, Object>> generatedRecipeMaps = new ArrayList<>();
        if (openAiResponse.getBody() instanceof Map) {
            Map<String, Object> responseMap = (Map<String, Object>) openAiResponse.getBody();
            if (responseMap.containsKey("recipes")) {
                Object recipesObj = responseMap.get("recipes");
                if (recipesObj instanceof List) {
                    generatedRecipeMaps = (List<Map<String, Object>>) recipesObj;
                }
            }
        }
        
        // Store the recipes and get the batch ID
        String batchId = temporaryRecipeService.storeBatch(generatedRecipeMaps);
        
        // Get the recipes from the service to ensure they're properly converted to Recipe objects
        List<Recipe> recipes = temporaryRecipeService.getBatch(batchId);
        
        // Convert the Recipe objects back to maps for the response
        List<Map<String, Object>> recipeMapList = recipes.stream()
                .map(Recipe::toMap)
                .collect(Collectors.toList());

        // 5. Return the batch ID and recipes
        Map<String, Object> result = new HashMap<>();
        result.put("batchId", batchId);
        result.put("message",
                "Recipes generated and stored temporarily. Connect via WebSocket and submit your selection to save them to Firestore.");
        result.put("generatedRecipeCount", recipes.size());
        result.put("recipes", recipeMapList); // Return as maps for backward compatibility
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
                                        "categories", Map.of("type", "array", "items", Map.of("type", "string")),
                                        "ingredients", Map.of("type", "array", "items", Map.of("type", "string")),
                                        "instructions", Map.of(
                                                "type", "array",
                                                "items", Map.of("type", "string")),
                                        "estimatedCookingTime", Map.of("type", "integer"),
                                        "servings", Map.of("type", "integer"))))));
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
            // Convert Java Map to JSON String
            String jsonRequest = objectMapper.writeValueAsString(requestBody);

            // Debug: Print request
            System.out.println("\n🔹 JSON Request Body:\n" + jsonRequest + "\n");

            // Set Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openAiApiKey);

            // Create HTTP Request
            HttpEntity<String> entity = new HttpEntity<>(jsonRequest, headers);

            // Make the API Call
            ResponseEntity<Map> response = restTemplate.exchange(
                    openAiApiUrl,
                    HttpMethod.POST,
                    entity,
                    Map.class);

            // Extract the result
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");

                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                    String content = (String) message.get("content");

                    // Debug: Print response
                    System.out.println("\n🔸 Raw Response:\n" + content);

                    // Parse the content as JSON
                    Map<String, Object> parsedResult = objectMapper.readValue(content, Map.class);
                    return ResponseEntity.ok(parsedResult);
                }
            }

            // In case of errors or unexpected format
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("Failed to process OpenAI response");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error calling OpenAI API: " + e.getMessage());
        }
    }
}
