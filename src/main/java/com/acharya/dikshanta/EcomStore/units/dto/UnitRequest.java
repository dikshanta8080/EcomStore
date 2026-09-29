package com.acharya.dikshanta.EcomStore.units.dto;

import com.acharya.dikshanta.EcomStore.units.enums.UnitType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UnitRequest(
        @NotBlank(message = "Unit name is required")
        @Size(max = 50, message = "Unit name cannot exceed 50 characters")
        String name,

        @NotBlank(message = "Unit symbol is required")
        @Size(max = 20, message = "Unit symbol cannot exceed 20 characters")
        String symbol,

        @NotNull(message = "Unit type is required")
        UnitType unitType
) {
}
