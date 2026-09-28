package com.acharya.dikshanta.EcomStore.inventory.dto.request;

import com.acharya.dikshanta.EcomStore.inventory.enums.MovementType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record InventoryMovementRequest(
        @NotNull(message = "Product ID cannot be null") Long productId,
        @NotNull(message = "Movement type cannot be null") MovementType movementType,
        @NotNull(message = "Quantity cannot be null")
        @Min(value = 1, message = "Quantity cannot be less than 1")
        Long quantity

) {
}
