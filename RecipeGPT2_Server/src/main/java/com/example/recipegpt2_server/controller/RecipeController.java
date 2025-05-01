package com.example.recipegpt2_server.controller;

import com.example.recipegpt2_server.service.TemporaryRecipeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.firebase.auth.FirebaseAuth;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api") // Base URL
public class RecipeController {

    @Autowired
    private FirebaseAuth firebaseAuth;

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
    //       Endpoints
    // ----------------------

//    @GetMapping("/getRecipes")
//    public ResponseEntity<?> getRecipes(@RequestParam String recipeQuery,
//                                        @RequestParam(defaultValue = "5") int numberOfRecipes) {
//
//        // 1) Build the JSON schema for recipes
//        Map<String, Object> recipeSchema = buildRecipeSchema();
//
//        // 2) Build request body
//        Map<String, Object> requestBody = buildRequestBody(
//                "gpt-4o",
//                "You are a recipe generator. Respond with valid JSON format, without extra escaping or backslashes.",
//                "Generate " + numberOfRecipes + " recipes for '" + recipeQuery + "' strictly following the given schema.",
//                "multiple_recipes_schema",
//                recipeSchema
//        );
//
//        // 3) Send request & parse content
//        return sendRequestToOpenAI(requestBody);
//    }

    /**
     * Modified getRecipes endpoint:
     * 1. Checks for an Authorization header containing a Firebase ID token.
     * 2. Generates recipes via OpenAI.
     * 3. Stores the resulting recipes in temporary memory and returns a batchId.
     */
    @GetMapping("/getRecipes")
    public ResponseEntity<?> getRecipes(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam String recipeQuery,
            @RequestParam(defaultValue = "5") int numberOfRecipes) {

        // 1. Validate the Authorization header
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Missing or invalid Authorization header.");
        }
        String idToken = authHeader.substring(7);
        String uid;
        try {
            var decodedToken = firebaseAuth.verifyIdToken(idToken);
            uid = decodedToken.getUid();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid or expired token: " + e.getMessage());
        }

        // 2. Build the JSON schema and request body for recipes
        Map<String, Object> recipeSchema = buildRecipeSchema();
        Map<String, Object> requestBody = buildRequestBody(
                "gpt-4o",
                "You are a recipe generator. Respond with valid JSON format, without extra escaping or backslashes.",
                "Generate " + numberOfRecipes + " recipes for '" + recipeQuery + "' strictly following the given schema.",
                "multiple_recipes_schema",
                recipeSchema
        );

        // 3. Call OpenAI API and parse the response
        ResponseEntity<?> openAiResponse = sendRequestToOpenAI(requestBody);
        // Expecting that openAiResponse.getBody() holds the generated recipes as a Map

        // 4. Store recipes temporarily and generate a batchId
        List<Map<String, Object>> generatedRecipes = new ArrayList<>();
        if (openAiResponse.getBody() instanceof Map) {
            // Depending on your schema, the recipes might be in a key such as "recipes"
            Map<String, Object> responseMap = (Map<String, Object>) openAiResponse.getBody();
            if (responseMap.containsKey("recipes")) {
                Object recipesObj = responseMap.get("recipes");
                if (recipesObj instanceof List) {
                    generatedRecipes = (List<Map<String, Object>>) recipesObj;
                }
            }
        }
        String batchId = temporaryRecipeService.storeBatch(generatedRecipes);

        // 5. Optionally, you might notify the client via WebSocket that recipes are ready.
        // (That WebSocket connection and messaging would be set up in another controller; see below.)

        // 6. Return the batch ID so the client can later indicate which recipes to save.
        Map<String, Object> result = new HashMap<>();
        result.put("batchId", batchId);
        result.put("message", "Recipes generated and stored temporarily. Connect via WebSocket and submit your selection to save them to Firestore.");
        result.put("generatedRecipeCount", generatedRecipes.size());
        result.put("recipes", generatedRecipes);
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
                quoteSchema
        );

        // 3) Send request & parse content
        return sendRequestToOpenAI(requestBody);
    }

    @GetMapping("/verify")
    public ResponseEntity<String> verifyToken(@RequestParam String token) {
        try {
            // Use FirebaseAuth to verify the ID token
            var decodedToken = firebaseAuth.verifyIdToken(token);
            String uid = decodedToken.getUid();

            // If successful, return the user's UID or any other info
            return ResponseEntity.ok("User ID: " + uid);
        } catch (Exception e) {
            // If token is invalid, handle the exception
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid token: " + e.getMessage());
        }
    }


    // ----------------------
    //   Internal Methods
    // ----------------------

    /**
     * Builds the request body for OpenAI with a JSON schema.
     */
    private Map<String, Object> buildRequestBody(
            String model,
            String systemPromptText,
            String userPromptText,
            String schemaName,
            Map<String, Object> schema
    ) {
        // "messages" array
        List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content", systemPromptText),
                Map.of("role", "user", "content", userPromptText)
        );

        // "response_format" with "json_schema"
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", messages);
        requestBody.put("response_format", Map.of(
                "type", "json_schema",
                "json_schema", Map.of(
                        "name", schemaName,
                        "schema", schema
                )
        ));

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
                                        "ingredients", Map.of(
                                                "type", "array",
                                                "items", Map.of(
                                                        "type", "object",
                                                        "properties", Map.of(
                                                                "item", Map.of("type", "string"),
                                                                "amount", Map.of("type", "number"),
                                                                "unit", Map.of("type", "string")
                                                        )
                                                )
                                        ),
                                        "instructions", Map.of(
                                                "type", "array",
                                                "items", Map.of("type", "string")
                                        ),
                                        "estimatedCookingTime", Map.of("type", "integer"),
                                        "servings", Map.of("type", "integer")
                                )
                        )
                )
        ));
        return recipeSchema;
    }

    /**
     * JSON schema for a random quote.
     */
    private Map<String, Object> buildQuoteSchema() {
        Map<String, Object> quoteSchema = new HashMap<>();
        quoteSchema.put("type", "object");
        quoteSchema.put("properties", Map.of(
                "quote", Map.of("type", "string")
        ));
        return quoteSchema;
    }

    /**
     * Sends the request to OpenAI and returns only the parsed JSON from message.content.
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
                    Map.class
            );

            Map<String, Object> responseBody = response.getBody();
            if (responseBody == null) {
                return ResponseEntity.status(response.getStatusCode())
                        .body(Map.of("error", "OpenAI returned empty response."));
            }

            // We only want the "content" from the first choice
            if (responseBody.containsKey("choices")) {
                List<?> choices = (List<?>) responseBody.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> firstChoice = (Map<String, Object>) choices.get(0);
                    if (firstChoice.containsKey("message")) {
                        Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                        if (message.containsKey("content")) {
                            // The actual JSON is inside "content"
                            String contentString = message.get("content").toString();
                            // Parse contentString to a Map (the actual user data)
                            Map<String, Object> parsedJson = objectMapper.readValue(contentString, Map.class);
                            // Return ONLY that parsed JSON, removing usage, tokens, etc.
                            return ResponseEntity.ok(parsedJson);
                        }
                    }
                }
            }

            // If no "choices" or no "message.content" found, return entire response for debugging
            return ResponseEntity.status(response.getStatusCode()).body(responseBody);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process request: " + e.getMessage()));
        }
    }
}
