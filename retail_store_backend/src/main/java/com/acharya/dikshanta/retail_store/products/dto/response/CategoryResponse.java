package com.acharya.dikshanta.retail_store.products.dto.response;

import lombok.Builder;

@Builder
public record CategoryResponse(
        Long id,
        String name,
        String description
) {
}
