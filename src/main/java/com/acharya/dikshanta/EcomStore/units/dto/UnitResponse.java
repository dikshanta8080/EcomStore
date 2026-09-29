package com.acharya.dikshanta.EcomStore.units.dto;

import com.acharya.dikshanta.EcomStore.units.enums.UnitType;
import lombok.Builder;

@Builder
public record UnitResponse(
        Long id,
        String name,
        String symbol,
        UnitType unitType
) {
}
