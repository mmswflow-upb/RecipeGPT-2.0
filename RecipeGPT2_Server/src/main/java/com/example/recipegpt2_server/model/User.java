package com.example.recipegpt2_server.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Data
@AllArgsConstructor
public class User implements UserDetails {
    private String id;
    private String email;
    private String username;
    private String password;
    private boolean admin;
    private String profile_pic;
    private String bio;
    private List<String> preferences;
    private List<String> savedRecipes;
    
    // NoArgsConstructor with non-null defaults for lists
    public User() {
        this.preferences = new ArrayList<>();
        this.savedRecipes = new ArrayList<>();
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (admin) {
            return Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN"));
        } else {
            return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
        }
    }

    @Override
    public String getUsername() {
        return email;
    }
    
    public String getUsernameField() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
} 