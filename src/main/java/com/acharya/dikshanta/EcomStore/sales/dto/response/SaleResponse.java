package com.acharya.dikshanta.EcomStore.sales.dto.response;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Builder
public record SaleResponse(
        UUID invoiceNumber,
        BigDecimal subTotal,
        BigDecimal discount,
        BigDecimal tax,
        BigDecimal total,
        List<SaleItemResponse> saleItems
) {
    @Builder
    public record SaleItemResponse(
            String productName,
            BigDecimal unitPrice,
            Long quantity,
            BigDecimal total,
            BigDecimal itemTax
    ) {

    }
}
