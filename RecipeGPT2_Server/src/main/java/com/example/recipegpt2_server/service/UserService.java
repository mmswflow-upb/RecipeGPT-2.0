package com.example.recipegpt2_server.service;

import com.example.recipegpt2_server.model.User;
import com.example.recipegpt2_server.model.UserRegistrationRequest;
import com.example.recipegpt2_server.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.concurrent.ExecutionException;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        try {
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        } catch (ExecutionException | InterruptedException e) {
            throw new UsernameNotFoundException("Error loading user: " + e.getMessage(), e);
        }
    }

    public User registerUser(UserRegistrationRequest request) throws ExecutionException, InterruptedException {
        // Check if user already exists
        try {
            userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
                throw new RuntimeException("User already exists with email: " + request.getEmail());
            });
        } catch (UsernameNotFoundException ignored) {
            // This is expected if the user doesn't exist
        }

        // Create and save new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setAdmin(request.isAdmin());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // Encode password
        
        // Set profile_pic and bio, ensuring they're not null
        user.setProfile_pic(request.getProfile_pic() != null ? request.getProfile_pic() : "");
        user.setBio(request.getBio() != null ? request.getBio() : "");
        
        // Set preferences, ensuring it's not null
        user.setPreferences(request.getPreferences() != null ? request.getPreferences() : new ArrayList<>());
        
        // Set savedRecipes, ensuring it's not null
        user.setSavedRecipes(request.getSavedRecipes() != null ? request.getSavedRecipes() : new ArrayList<>());

        return userRepository.save(user);
    }
} 