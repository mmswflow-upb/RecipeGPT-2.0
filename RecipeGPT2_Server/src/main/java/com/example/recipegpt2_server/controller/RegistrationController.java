package com.example.recipegpt2_server.controller;

import com.example.recipegpt2_server.model.UserRegistrationRequest;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.auth.UserRecord.CreateRequest;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class RegistrationController {

    @Autowired
    private FirebaseAuth firebaseAuth;

    /**
     * Endpoint for user registration.
     * This endpoint creates a new user in Firebase Auth and stores additional details in Firestore.
     * Admin users are stored in a separate "admins" collection while normal users go into "users".
     *
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRegistrationRequest request) {
        try {
            // 1. Create a Firebase Auth user using the provided data.
            CreateRequest createRequest = new CreateRequest()
                    .setEmail(request.getEmail())
                    .setPassword(request.getPassword())
                    .setDisplayName(request.getDisplayName());
            UserRecord userRecord = firebaseAuth.createUser(createRequest);

            // 2. If this registration is for an admin, set a custom claim.
            if (request.isAdmin()) {
                Map<String, Object> claims = new HashMap<>();
                claims.put("isAdmin", true);
                firebaseAuth.setCustomUserClaims(userRecord.getUid(), claims);
            }

            // 3. Prepare additional user data to store in Firestore.
            Map<String, Object> userData = new HashMap<>();
            userData.put("email", request.getEmail());
            userData.put("displayName", request.getDisplayName());
            userData.put("admin", request.isAdmin());
            userData.put("uid", userRecord.getUid());
            // Optionally, include additional fields like registration timestamp, etc.
            // userData.put("registeredAt", System.currentTimeMillis());

            // 4. Get Firestore instance.
            Firestore firestore = FirestoreClient.getFirestore();

            // 5. Write user data to the appropriate collection:
            //    - "admins" for admin users, "users" for normal users.
            String collectionName = request.isAdmin() ? "admins" : "users";
            ApiFuture<?> writeResult = firestore.collection(collectionName)
                    .document(userRecord.getUid()).set(userData);
            // Optionally wait for the write to complete:
            writeResult.get();

            // 6. Return a success response with the new user's UID.
            return ResponseEntity.ok("User registered successfully with UID: " + userRecord.getUid());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error during registration: " + e.getMessage());
        }
    }
}
