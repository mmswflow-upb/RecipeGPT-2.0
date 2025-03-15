//package com.example.recipegpt2_server.controller;
//
//import org.springframework.ai.chat.model.ChatResponse;
//import org.springframework.ai.openai.OpenAiChatModel;
//import org.springframework.ai.chat.prompt.Prompt;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api") // Base URL
//public class RecipeController {
//
//    private final OpenAiChatModel openAiChatModel;
//
//    public RecipeController(OpenAiChatModel openAiChatModel) {
//        this.openAiChatModel = openAiChatModel;
//    }
//
//    @GetMapping("/getRecipes")
//    public Map<String, Object> getRecipes(@RequestParam String recipeQuery,
//                                          @RequestParam(defaultValue = "5") int numberOfRecipes) {
//        String promptText = "Generate " + numberOfRecipes + " recipes for \"" + recipeQuery +
//                "\" strictly following the given schema. All ingredient names must be lowercase.";
//        Prompt prompt = new Prompt(promptText);
//
//        // Call OpenAI API
//        ChatResponse response = openAiChatModel.call(prompt);
//
//        return Map.of("recipes", response);
//    }
//
//    @GetMapping("/randomQuote")
//    public Map<String, Object> getRandomQuote() {
//        String promptText = "Generate a random quote about cooking.";
//        Prompt prompt = new Prompt(promptText);
//
//        // Call OpenAI API
//        ChatResponse response = openAiChatModel.call(prompt);
//
//        return Map.of("quote", response);
//    }
//}

package com.example.recipegpt2_server.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.service.annotation.HttpExchange;

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

    // Method for building the request body based on some input parameters
    private Map<String, Object> buildRequestBody(String model, String systemPromptText,String userPromptText, String schemaName, Map<String, Object> schema) {
        // Define Messages as List
        List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content",  systemPromptText+
                        "Respond with valid JSON format, without extra escaping or backslashes."),
                Map.of("role", "user", "content", userPromptText)
        );

        // Construct Request Body
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", messages); // ✅ Proper JSON array
        requestBody.put("response_format", Map.of(
                "type", "json_schema",
                "json_schema", Map.of(
                        "name", schemaName,
                        "schema", schema // ✅ Now includes `schema`
                )
        ));

        return requestBody;
    }


    @GetMapping("/getRecipes")
    public ResponseEntity<Map<String, Object>> getRecipes(@RequestParam String recipeQuery,
                                                          @RequestParam(defaultValue = "5") int numberOfRecipes) {

        // 🔹 Define JSON Schema (Fixes Missing `name` Parameter)
        Map<String, Object> recipeSchema = new HashMap<>();
        recipeSchema.put("name", "multiple_recipes_schema"); // ✅ Fixes Missing Name!
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



        // 🔹 Construct Request Body
        Map<String, Object> requestBody = buildRequestBody(
                "gpt-4o",
                "You are a recipe generator.",
                "Generate " + numberOfRecipes + " recipes for '" + recipeQuery +
                        "' strictly following the given schema.",
                "multiple_recipes_schema",
                recipeSchema
        );



        return sendRequestToOpenAI(requestBody);
    }

    @GetMapping("/randomQuote")
    public ResponseEntity<Map<String, Object>> getRandomQuote() {
        // 🔹 Define JSON Schema for Quotes
        Map<String, Object> quoteSchema = new HashMap<>();
        quoteSchema.put("name", "random_quote_schema"); // ✅ Fixes Missing Name!
        quoteSchema.put("type", "object");
        quoteSchema.put("properties", Map.of(
                "quote", Map.of("type", "string")
        ));



        Map<String, Object> requestBody = buildRequestBody(
                "gpt-4o",
                "You are a renowned chef and philosopher.",
                "Generate a random quote about cooking strictly following the given schema.",
                "random_quote_schema",
                quoteSchema
        );
        return sendRequestToOpenAI(requestBody);
    }

    private ResponseEntity<Map<String, Object>> sendRequestToOpenAI(Map<String, Object> requestBody) {
        try {
            // Convert Java Map to JSON String
            String jsonRequest = objectMapper.writeValueAsString(requestBody);

            // Set Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + openAiApiKey);

            // Create HTTP Request
            HttpEntity<String> entity = new HttpEntity<>(jsonRequest, headers);

            // Make the API Call
            ResponseEntity<Map> response = restTemplate.exchange(openAiApiUrl, HttpMethod.POST, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();


            if (responseBody != null) {
                // Case 1: Response contains "choices" (typical for chat completions)
                if (responseBody.containsKey("choices")) {
                    List<?> choices = (List<?>) responseBody.get("choices");
                    if (!choices.isEmpty()) {
                        Map<String, Object> firstChoice = (Map<String, Object>) choices.get(0);
                        if (firstChoice.containsKey("message")) {
                            Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                            if (message.containsKey("content")) {
                                String contentString = message.get("content").toString();
                                // Deserialize the JSON string inside "content"
                                Map<String, Object> parsedContent = objectMapper.readValue(contentString, Map.class);
                                message.put("content", parsedContent);
                            }
                        }
                    }
                }
                // Case 2: Response directly contains "content"
                else if (responseBody.containsKey("content")) {
                    String contentString = responseBody.get("content").toString();
                    Map<String, Object> parsedContent = objectMapper.readValue(contentString, Map.class);
                    responseBody.put("content", parsedContent);
                }
            }

            return ResponseEntity.status(response.getStatusCode()).body(responseBody);
        } catch (Exception e) {
            e.printStackTrace(); // Log full error for debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process request: " + e.getMessage()));
        }
    }

    private void printJsonRequest(Map<String, Object> requestBody) {
        try {
            // ✅ Print formatted JSON before sending request
            String jsonString = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(requestBody);
            System.out.println("\n🔹 JSON Request Body:\n" + jsonString + "\n");
        } catch (Exception e) {
            System.err.println("❌ Error converting request body to JSON: " + e.getMessage());
        }
    }
}


