package com.acharya.dikshanta.EcomStore.products.dto.request;

import java.math.BigDecimal;

public record ProductFilterRequest(
        String nameOrCategoryName,
        String sku,
        Long categoryId,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        Integer minStock,
        Integer maxStock,
        Boolean active
) {
}
