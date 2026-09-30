package com.acharya.dikshanta.retail_store.products.dto.request;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record TaxRateRequest(
        @NotNull(message = "rate can not be null") BigDecimal rate
) {
}
