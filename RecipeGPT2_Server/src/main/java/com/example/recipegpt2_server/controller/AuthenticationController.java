package com.example.recipegpt2_server.controller;

import com.example.recipegpt2_server.model.LoginRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {

    // Inject the Firebase API key from application.properties
    @Value("${firebase.api.key}")
    private String firebaseApiKey;

    // Create a RestTemplate instance
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Login endpoint.
     * Clients send an email and password, and this endpoint calls the Firebase REST API
     * signInWithPassword endpoint. If authentication succeeds, Firebase returns an idToken,
     * refreshToken, and other info, which are then passed back in the response.
     *
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        // Firebase sign-in endpoint URL. It requires the API key as a query parameter.
        String url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + firebaseApiKey;

        // Build the payload for Firebase.
        Map<String, Object> payload = new HashMap<>();
        payload.put("email", loginRequest.getEmail());
        payload.put("password", loginRequest.getPassword());
        payload.put("returnSecureToken", true); // Must be true to get an idToken back

        try {
            // Call Firebase Authentication REST endpoint.
            ResponseEntity<Map> response = restTemplate.postForEntity(url, payload, Map.class);

            // Return the response body (contains idToken, refreshToken, etc.) back to the client.
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            e.printStackTrace();
            // On error (e.g. invalid credentials), return an error response.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid credentials or error: " + e.getMessage());
        }
    }
}
