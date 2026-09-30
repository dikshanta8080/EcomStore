package com.acharya.dikshanta.retail_store.products.dto.response;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record TaxRateResponse(
        Long id,
        BigDecimal rate
) {
}
