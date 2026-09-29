package com.acharya.dikshanta.EcomStore.inventory.dto.request;

import com.acharya.dikshanta.EcomStore.inventory.enums.MovementType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record InventoryMovementRequest(
        @NotNull(message = "Product ID cannot be null")
        Long productId,

        @NotNull(message = "Movement type cannot be null")
        MovementType movementType,

        @NotNull(message = "Quantity cannot be null")
        @DecimalMin(value = "0.0001", message = "Quantity must be greater than 0")
        BigDecimal quantity,

        @NotNull(message = "Unit ID cannot be null")
        Long unitId,

        @DecimalMin(value = "0.0", message = "Unit price must be non-negative")
        BigDecimal unitPrice
) {
}
