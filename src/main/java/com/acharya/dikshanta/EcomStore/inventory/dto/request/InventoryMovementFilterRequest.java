package com.acharya.dikshanta.EcomStore.inventory.dto.request;

import com.acharya.dikshanta.EcomStore.inventory.enums.MovementType;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InventoryMovementFilterRequest(
        String search,
        String nameOrCategoryName,
        String sku,
        Long productId,
        Long categoryId,
        MovementType movementType,
        Long unitId,
        BigDecimal minQuantity,
        BigDecimal maxQuantity,
        BigDecimal minTotalAmount,
        BigDecimal maxTotalAmount,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate startDate,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate endDate,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate fromDate,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate toDate
) {
    public InventoryMovementFilterRequest(
            String search,
            String nameOrCategoryName,
            String sku,
            Long productId,
            Long categoryId,
            MovementType movementType,
            Long unitId,
            BigDecimal minQuantity,
            BigDecimal maxQuantity,
            BigDecimal minTotalAmount,
            BigDecimal maxTotalAmount,
            LocalDate startDate,
            LocalDate endDate
    ) {
        this(search, nameOrCategoryName, sku, productId, categoryId, movementType, unitId, minQuantity, maxQuantity, minTotalAmount, maxTotalAmount, startDate, endDate, null, null);
    }
}
