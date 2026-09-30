package com.acharya.dikshanta.retail_store.products.dto.response;

import java.math.BigDecimal;

public record ProductSummaryResponse(
        long totalProducts,
        BigDecimal totalStockUnits,
        long healthyStockCount,
        long lowStockCount,
        long outOfStockCount
) {
}
