package com.acharya.dikshanta.retail_store.units.dto;

import com.acharya.dikshanta.retail_store.units.enums.UnitType;
import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record ProductUnitConversionResponse(
        Long id,
        Long productId,
        String productName,
        Long unitId,
        String unitName,
        String unitSymbol,
        UnitType unitType,
        BigDecimal conversionFactor,
        Boolean active
) {
}
