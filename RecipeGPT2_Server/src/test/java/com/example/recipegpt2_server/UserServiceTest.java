package com.example.recipegpt2_server;

import com.example.recipegpt2_server.model.User;
import com.example.recipegpt2_server.model.UserRegistrationRequest;
import com.example.recipegpt2_server.model.UserUpdateRequest;
import com.example.recipegpt2_server.model.SavedRecipesUpdateRequest;
import com.example.recipegpt2_server.repository.UserRepository;
import com.example.recipegpt2_server.service.UserService;
import com.example.recipegpt2_server.service.RecipeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.lang.reflect.Field;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserServiceTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private RecipeService recipeService;
    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() throws Exception {
        MockitoAnnotations.openMocks(this);
        userService = new UserService(userRepository, passwordEncoder);
        // Inject the mock recipeService using reflection
        Field field = UserService.class.getDeclaredField("recipeService");
        field.setAccessible(true);
        field.set(userService, recipeService);
    }

    @Test
    void registerUser_success() throws ExecutionException, InterruptedException {
        UserRegistrationRequest request = new UserRegistrationRequest();
        request.setEmail("test@example.com");
        request.setPassword("password");
        request.setUsername("testuser");
        request.setPublisher(false);

        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User user = userService.registerUser(request);
        assertEquals("test@example.com", user.getEmail());
        assertEquals("testuser", user.getUsernameField());
        assertEquals("encodedPassword", user.getPassword());
        assertFalse(user.isPublisher());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void registerUser_duplicateEmail_throwsException() throws Exception {
        UserRegistrationRequest request = new UserRegistrationRequest();
        request.setEmail("test@example.com");
        request.setPassword("password");
        request.setUsername("testuser");
        request.setPublisher(false);

        when(userRepository.findByEmail(any())).thenReturn(Optional.of(new User()));

        assertThrows(RuntimeException.class, () -> userService.registerUser(request));
    }

    @Test
    void updateUser_success() throws Exception {
        String email = "test@example.com";
        UserUpdateRequest updateRequest = new UserUpdateRequest();
        updateRequest.setUsername("newuser");
        updateRequest.setPassword("newpass");
        updateRequest.setProfile_pic("pic.png");
        updateRequest.setBio("bio");

        User user = new User();
        user.setEmail(email);
        user.setUsername("olduser");
        user.setPassword("oldpass");
        user.setProfile_pic("");
        user.setBio("");

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(any())).thenReturn("encodedNewPass");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User updated = userService.updateUser(email, updateRequest);
        assertEquals("newuser", updated.getUsernameField());
        assertEquals("encodedNewPass", updated.getPassword());
        assertEquals("pic.png", updated.getProfile_pic());
        assertEquals("bio", updated.getBio());
    }

    @Test
    void updateUser_partialFields() throws Exception {
        String email = "test@example.com";
        UserUpdateRequest updateRequest = new UserUpdateRequest();
        updateRequest.setUsername("partialuser"); // Only username is set

        User user = new User();
        user.setEmail(email);
        user.setUsername("olduser");
        user.setPassword("oldpass");
        user.setProfile_pic("oldpic.png");
        user.setBio("oldbio");

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User updated = userService.updateUser(email, updateRequest);
        assertEquals("partialuser", updated.getUsernameField());
        assertEquals("oldpass", updated.getPassword());
        assertEquals("oldpic.png", updated.getProfile_pic());
        assertEquals("oldbio", updated.getBio());
    }

    @Test
    void updateSavedRecipes_invalidRecipe_throwsException() throws Exception {
        String email = "test@example.com";
        User user = new User();
        user.setId("userId");
        user.setEmail(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        SavedRecipesUpdateRequest updateRequest = new SavedRecipesUpdateRequest();
        updateRequest.setSavedRecipes(java.util.Collections.singletonList("invalidRecipeId"));

        when(recipeService.getRecipeById("invalidRecipeId")).thenReturn(null);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertThrows(IllegalArgumentException.class, () -> userService.updateSavedRecipes(email, updateRequest));
    }

    @Test
    void deleteSavedRecipes_nonExistentRecipe_throwsException() throws Exception {
        String email = "test@example.com";
        User user = new User();
        user.setId("userId");
        user.setEmail(email);
        user.setSavedRecipes(java.util.Arrays.asList("r1", "r2"));
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        com.example.recipegpt2_server.model.DeleteSavedRecipesRequest deleteRequest = new com.example.recipegpt2_server.model.DeleteSavedRecipesRequest();
        deleteRequest.setRecipeIds(java.util.Arrays.asList("nonexistent"));

        when(recipeService.getRecipeById("nonexistent")).thenReturn(null);

        assertThrows(IllegalArgumentException.class, () -> userService.deleteSavedRecipes(email, deleteRequest));
    }

    @Test
    void deleteSavedRecipes_emptyList_doesNothing() throws Exception {
        String email = "test@example.com";
        User user = new User();
        user.setId("userId");
        user.setEmail(email);
        user.setSavedRecipes(java.util.Arrays.asList("r1", "r2"));
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        com.example.recipegpt2_server.model.DeleteSavedRecipesRequest deleteRequest = new com.example.recipegpt2_server.model.DeleteSavedRecipesRequest();
        deleteRequest.setRecipeIds(java.util.Collections.emptyList());

        User result = userService.deleteSavedRecipes(email, deleteRequest);
        assertEquals(user, result);
    }
}