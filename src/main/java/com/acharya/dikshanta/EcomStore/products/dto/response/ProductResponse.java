package com.acharya.dikshanta.EcomStore.products.dto.response;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record ProductResponse(
        Long id,
        String name,
        String sku,
        String description,
        BigDecimal price,
        Long categoryId,
        String categoryName

) {
}
