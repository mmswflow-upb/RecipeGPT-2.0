package com.example.recipegpt2_server.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/queue");      // where the broker will publish
        config.setApplicationDestinationPrefixes("/app"); // where you send
        config.setUserDestinationPrefix("/user"); // enables /user/queue/…
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // NO SockJS – plain WebSocket so CLI tools work
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
    }
}
