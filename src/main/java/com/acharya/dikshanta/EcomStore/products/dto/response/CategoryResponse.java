package com.acharya.dikshanta.EcomStore.products.dto.response;

import lombok.Builder;

@Builder
public record CategoryResponse(
        Long id,
        String name,
        String description
) {
}
