package com.acharya.dikshanta.retail_store.units.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ProductUnitConversionRequest(
        @NotNull(message = "Unit ID is required")
        Long unitId,

        @NotNull(message = "Conversion factor is required")
        @DecimalMin(value = "0.0001", message = "Conversion factor must be greater than 0")
        BigDecimal conversionFactor,

        Boolean active
) {
}
