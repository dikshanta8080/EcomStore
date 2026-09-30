package com.acharya.dikshanta.retail_store.products.dto.response;

import com.acharya.dikshanta.retail_store.units.dto.ProductUnitConversionResponse;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

@Builder
public record ProductResponse(
        Long id,
        String name,
        String sku,
        String description,
        BigDecimal price,
        Long categoryId,
        String categoryName,
        BigDecimal stock,
        Long baseUnitId,
        String baseUnitName,
        String baseUnitSymbol,
        Long taxRateId,
        BigDecimal taxRate,
        Boolean active,
        List<ProductUnitConversionResponse> conversions
) {
}
