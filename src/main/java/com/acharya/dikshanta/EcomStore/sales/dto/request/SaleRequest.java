package com.acharya.dikshanta.EcomStore.sales.dto.request;

import java.math.BigDecimal;
import java.util.List;

public record SaleRequest(
        BigDecimal discountAmount,
        BigDecimal discountPercentage,
        List<SaleItemRequest> saleItems

) {
    public record SaleItemRequest(
            Long productId,
            Integer quantity
    ) {
    }
}
