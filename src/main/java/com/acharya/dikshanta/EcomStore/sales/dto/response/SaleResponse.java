package com.acharya.dikshanta.EcomStore.sales.dto.response;

import com.acharya.dikshanta.EcomStore.sales.enums.SaleStatus;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Builder
public record SaleResponse(
        Long id,
        UUID invoiceNumber,
        SaleStatus status,
        BigDecimal subTotal,
        BigDecimal discount,
        BigDecimal tax,
        BigDecimal total,
        LocalDateTime createdAt,
        List<SaleItemResponse> saleItems
) {
    @Builder
    public record SaleItemResponse(
            Long id,
            Long productId,
            String productName,
            BigDecimal unitPrice,
            Long quantity,
            BigDecimal total,
            BigDecimal itemTax
    ) {
    }
}
