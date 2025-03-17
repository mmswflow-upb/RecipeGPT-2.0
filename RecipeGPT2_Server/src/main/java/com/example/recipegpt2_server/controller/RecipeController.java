package com.example.recipegpt2_server.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api") // Base URL
public class RecipeController {

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

    @GetMapping("/getRecipes")
    public ResponseEntity<?> getRecipes(@RequestParam String recipeQuery,
                                        @RequestParam(defaultValue = "5") int numberOfRecipes) {

        // 1) Build the JSON schema for recipes
        Map<String, Object> recipeSchema = buildRecipeSchema();

        // 2) Build request body
        Map<String, Object> requestBody = buildRequestBody(
                "gpt-4o",
                "You are a recipe generator. Respond with valid JSON format, without extra escaping or backslashes.",
                "Generate " + numberOfRecipes + " recipes for '" + recipeQuery + "' strictly following the given schema.",
                "multiple_recipes_schema",
                recipeSchema
        );

        // 3) Send request & parse content
        return sendRequestToOpenAI(requestBody);
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
