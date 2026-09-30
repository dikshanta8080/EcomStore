package com.acharya.dikshanta.retail_store.inventory.dto.response;

import com.acharya.dikshanta.retail_store.inventory.enums.MovementType;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
public record InventoryMovementResponse(
        Long id,
        MovementType movementType,
        BigDecimal quantity,
        Long unitId,
        String unitName,
        String unitSymbol,
        BigDecimal baseQuantity,
        Long baseUnitId,
        String baseUnitName,
        String baseUnitSymbol,
        BigDecimal conversionFactor,
        Long productId,
        String productName,
        Long inventoryId,
        Long categoryId,
        String categoryName,
        BigDecimal unitPrice,
        BigDecimal totalAmount,
        LocalDateTime movementDate
) {
}
