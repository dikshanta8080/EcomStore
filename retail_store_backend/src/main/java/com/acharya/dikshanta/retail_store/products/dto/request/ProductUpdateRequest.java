package com.acharya.dikshanta.retail_store.products.dto.request;

import java.math.BigDecimal;

public record ProductUpdateRequest(
        String name,
        String sku,
        String description,
        BigDecimal price,
        Long categoryId,
        Long baseUnitId,
        Long taxRateId
) {
}
