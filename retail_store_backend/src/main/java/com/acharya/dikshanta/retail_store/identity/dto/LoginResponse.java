package com.acharya.dikshanta.retail_store.identity.dto;

public record LoginResponse(
        String token,
        String tokenType,
        UserSummaryResponse user
) {
    public LoginResponse(String token, UserSummaryResponse user) {
        this(token, "Bearer", user);
    }
}
