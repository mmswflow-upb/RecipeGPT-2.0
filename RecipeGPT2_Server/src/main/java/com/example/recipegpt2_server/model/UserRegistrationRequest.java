package com.example.recipegpt2_server.model;

public class UserRegistrationRequest {
    private String email;
    private String password;
    private String displayName;
    private boolean admin; // if true, this registration is for an admin user

    // Constructors (optional), getters, and setters:

    public UserRegistrationRequest() { }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public String getDisplayName() {
        return displayName;
    }
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }
    public boolean isAdmin() {
        return admin;
    }
    public void setAdmin(boolean admin) {
        this.admin = admin;
    }
}
