package com.acharya.dikshanta.retail_store.units.dto;

import com.acharya.dikshanta.retail_store.units.enums.UnitType;
import lombok.Builder;

@Builder
public record UnitResponse(
        Long id,
        String name,
        String symbol,
        UnitType unitType
) {
}
