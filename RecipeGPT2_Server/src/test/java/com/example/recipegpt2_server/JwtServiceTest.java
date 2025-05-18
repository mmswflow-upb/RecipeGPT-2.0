package com.example.recipegpt2_server;

import com.example.recipegpt2_server.model.User;
import com.example.recipegpt2_server.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        // Set secret and expiration for testing
        ReflectionTestUtils.setField(jwtService, "jwtSecret",
                "ZmFrZXNlY3JldGtleWZvcnRlc3RpbmcxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTA=");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 3600000L); // 1 hour
    }

    @Test
    void generateAndValidateToken_success() {
        User user = new User();
        user.setId("user123");
        user.setEmail("test@example.com");
        user.setUsername("testuser");
        user.setPassword("password");
        user.setPublisher(false);

        String token = jwtService.generateToken(user);
        assertNotNull(token);
        assertTrue(jwtService.isTokenValid(token, user));
        assertEquals("test@example.com", jwtService.extractUsername(token));
    }
}