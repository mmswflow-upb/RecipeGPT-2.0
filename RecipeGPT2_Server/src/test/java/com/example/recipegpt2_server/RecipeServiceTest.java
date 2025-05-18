package com.example.recipegpt2_server;

import com.example.recipegpt2_server.model.Recipe;
import com.example.recipegpt2_server.service.RecipeService;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.WriteResult;
import com.google.firebase.cloud.FirestoreClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class RecipeServiceTest {
    @InjectMocks
    private RecipeService recipeService;

    @BeforeEach
    void setUp() {
        recipeService = new RecipeService();
    }

    @Test
    void saveRecipe_success() throws Exception {
        Recipe recipe = new Recipe();
        recipe.setTitle("Test Recipe");
        recipe.setUserId("user123");

        Firestore firestore = mock(Firestore.class);
        CollectionReference recipesCollection = mock(CollectionReference.class);
        ApiFuture<DocumentReference> addFuture = mock(ApiFuture.class);
        DocumentReference recipeDocRef = mock(DocumentReference.class);

        // Mock for user document update (createdRecipes)
        CollectionReference usersCollection = mock(CollectionReference.class);
        DocumentReference userDocRef = mock(DocumentReference.class);
        ApiFuture<com.google.cloud.firestore.DocumentSnapshot> userGetFuture = mock(ApiFuture.class);
        com.google.cloud.firestore.DocumentSnapshot userDocSnapshot = mock(
                com.google.cloud.firestore.DocumentSnapshot.class);
        ApiFuture<WriteResult> updateFuture = mock(ApiFuture.class);

        // Mock Firestore collections
        when(firestore.collection("recipes")).thenReturn(recipesCollection);
        when(firestore.collection("users")).thenReturn(usersCollection);

        // Mock adding recipe
        when(recipesCollection.add(any())).thenReturn(addFuture);
        when(addFuture.get()).thenReturn(recipeDocRef);
        when(recipeDocRef.getId()).thenReturn("fakeId");

        // Mock user document retrieval and update
        when(usersCollection.document("user123")).thenReturn(userDocRef);
        when(userDocRef.get()).thenReturn(userGetFuture);
        when(userGetFuture.get()).thenReturn(userDocSnapshot);
        when(userDocSnapshot.exists()).thenReturn(true);
        when(userDocSnapshot.get("createdRecipes")).thenReturn(null); // Simulate no createdRecipes yet
        when(userDocRef.update(eq("createdRecipes"), any())).thenReturn(updateFuture);
        when(updateFuture.get()).thenReturn(null);

        try (MockedStatic<FirestoreClient> firestoreClientMockedStatic = Mockito.mockStatic(FirestoreClient.class)) {
            firestoreClientMockedStatic.when(FirestoreClient::getFirestore).thenReturn(firestore);
            Recipe savedRecipe = recipeService.saveRecipe(recipe);
            assertEquals("Test Recipe", savedRecipe.getTitle());
            assertEquals("fakeId", savedRecipe.getId());
        }
    }

    @Test
    void getRecipeById_notFound_returnsNull() throws Exception {
        Firestore firestore = mock(Firestore.class);
        CollectionReference collectionReference = mock(CollectionReference.class);
        DocumentReference documentReference = mock(DocumentReference.class);
        ApiFuture<DocumentSnapshot> apiFuture = mock(ApiFuture.class);
        DocumentSnapshot documentSnapshot = mock(DocumentSnapshot.class);

        when(firestore.collection(any())).thenReturn(collectionReference);
        when(collectionReference.document(any())).thenReturn(documentReference);
        when(documentReference.get()).thenReturn(apiFuture);
        when(apiFuture.get()).thenReturn(documentSnapshot);
        when(documentSnapshot.exists()).thenReturn(false);

        try (MockedStatic<FirestoreClient> firestoreClientMockedStatic = Mockito.mockStatic(FirestoreClient.class)) {
            firestoreClientMockedStatic.when(FirestoreClient::getFirestore).thenReturn(firestore);
            assertNull(recipeService.getRecipeById("nonexistent"));
        }
    }

    @Test
    void updateRecipeRating_invalidValue_throwsException() {
        assertThrows(IllegalArgumentException.class, () -> recipeService.updateRecipeRating("id", 6.0));
        assertThrows(IllegalArgumentException.class, () -> recipeService.updateRecipeRating("id", -1.0));
    }

    @Test
    void deleteRecipe_nonExistent_returnsFalse() throws Exception {
        Firestore firestore = mock(Firestore.class);
        when(firestore.collection(any())).thenReturn(mock(CollectionReference.class));
        try (MockedStatic<FirestoreClient> firestoreClientMockedStatic = Mockito.mockStatic(FirestoreClient.class)) {
            firestoreClientMockedStatic.when(FirestoreClient::getFirestore).thenReturn(firestore);
            // Simulate getRecipeById returns null
            RecipeService spyService = spy(recipeService);
            doReturn(null).when(spyService).getRecipeById("nonexistent");
            assertFalse(spyService.deleteRecipe("nonexistent"));
        }
    }

    @Test
    void updateRecipe_notOwner_throwsSecurityException() throws Exception {
        RecipeService spyService = spy(recipeService);
        Recipe existing = new Recipe();
        existing.setId("r1");
        existing.setUserId("ownerId");
        doReturn(existing).when(spyService).getRecipeById("r1");
        com.example.recipegpt2_server.model.RecipeUpdateRequest updateRequest = new com.example.recipegpt2_server.model.RecipeUpdateRequest();
        com.example.recipegpt2_server.model.User notOwner = new com.example.recipegpt2_server.model.User();
        notOwner.setId("notOwnerId");
        assertThrows(SecurityException.class, () -> spyService.updateRecipe("r1", updateRequest, notOwner));
    }

    @Test
    void updateRecipe_notFound_throwsIllegalArgumentException() throws Exception {
        RecipeService spyService = spy(recipeService);
        doReturn(null).when(spyService).getRecipeById("notfound");
        com.example.recipegpt2_server.model.RecipeUpdateRequest updateRequest = new com.example.recipegpt2_server.model.RecipeUpdateRequest();
        com.example.recipegpt2_server.model.User user = new com.example.recipegpt2_server.model.User();
        user.setId("userId");
        assertThrows(IllegalArgumentException.class, () -> spyService.updateRecipe("notfound", updateRequest, user));
    }
}