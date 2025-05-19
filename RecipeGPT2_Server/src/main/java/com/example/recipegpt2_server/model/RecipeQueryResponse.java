package com.example.recipegpt2_server.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeQueryResponse {
    private String responseToUser;
    private String summaryOfConvo;
} 