package com.acharya.dikshanta.retail_store.sales.dto.request;

import java.math.BigDecimal;
import java.util.List;

public record SaleRequest(
        BigDecimal discountAmount,
        List<SaleItemRequest> saleItems

) {
    public record SaleItemRequest(
            Long productId,
            Integer quantity
    ) {
    }
}
