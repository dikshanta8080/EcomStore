package com.acharya.dikshanta.EcomStore.inventory.mapper;

import com.acharya.dikshanta.EcomStore.inventory.dto.request.InventoryMovementRequest;
import com.acharya.dikshanta.EcomStore.inventory.dto.response.InventoryMovementResponse;
import com.acharya.dikshanta.EcomStore.inventory.model.InventoryMovement;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class InventoryMapper {
    public InventoryMovement toEntity(InventoryMovementRequest request) {
        return InventoryMovement.builder()
                .movementType(request.movementType())
                .quantity(request.quantity())
                .unitPrice(request.unitPrice())
                .build();
    }

    public InventoryMovementResponse toResponse(InventoryMovement inventoryMovement) {
        var product = inventoryMovement.getInventory().getProduct();
        var category = product != null ? product.getCategory() : null;
        var unit = inventoryMovement.getUnit();
        var baseUnit = inventoryMovement.getBaseUnit();

        return InventoryMovementResponse.builder()
                .id(inventoryMovement.getId())
                .movementType(inventoryMovement.getMovementType())
                .quantity(inventoryMovement.getQuantity())
                .unitId(unit != null ? unit.getId() : null)
                .unitName(unit != null ? unit.getName() : null)
                .unitSymbol(unit != null ? unit.getSymbol() : null)
                .baseQuantity(inventoryMovement.getBaseQuantity())
                .baseUnitId(baseUnit != null ? baseUnit.getId() : null)
                .baseUnitName(baseUnit != null ? baseUnit.getName() : null)
                .baseUnitSymbol(baseUnit != null ? baseUnit.getSymbol() : null)
                .conversionFactor(inventoryMovement.getConversionFactor())
                .productId(product != null ? product.getId() : null)
                .productName(product != null ? product.getName() : null)
                .inventoryId(inventoryMovement.getInventory() != null ? inventoryMovement.getInventory().getId() : null)
                .categoryId(category != null ? category.getId() : null)
                .categoryName(category != null ? category.getName() : null)
                .unitPrice(inventoryMovement.getUnitPrice())
                .totalAmount(inventoryMovement.getTotalAmount())
                .movementDate(inventoryMovement.getCreatedAt() != null ? inventoryMovement.getCreatedAt() : LocalDateTime.now())
                .build();
    }
}
