package com.acharya.dikshanta.EcomStore.units.mapper;

import com.acharya.dikshanta.EcomStore.units.dto.ProductUnitConversionResponse;
import com.acharya.dikshanta.EcomStore.units.model.ProductUnitConversion;
import org.springframework.stereotype.Component;

@Component
public class ProductUnitConversionMapper {

    public ProductUnitConversionResponse toResponse(ProductUnitConversion conversion) {
        if (conversion == null) return null;
        return ProductUnitConversionResponse.builder()
                .id(conversion.getId())
                .productId(conversion.getProduct() != null ? conversion.getProduct().getId() : null)
                .productName(conversion.getProduct() != null ? conversion.getProduct().getName() : null)
                .unitId(conversion.getUnit() != null ? conversion.getUnit().getId() : null)
                .unitName(conversion.getUnit() != null ? conversion.getUnit().getName() : null)
                .unitSymbol(conversion.getUnit() != null ? conversion.getUnit().getSymbol() : null)
                .unitType(conversion.getUnit() != null ? conversion.getUnit().getUnitType() : null)
                .conversionFactor(conversion.getConversionFactor())
                .active(conversion.getActive())
                .build();
    }
}
