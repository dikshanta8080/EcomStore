package com.acharya.dikshanta.EcomStore.inventory.mapper;

import com.acharya.dikshanta.EcomStore.inventory.dto.request.InventoryMovementRequest;
import com.acharya.dikshanta.EcomStore.inventory.dto.response.InventoryMovementResponse;
import com.acharya.dikshanta.EcomStore.inventory.model.InventoryMovement;
import org.springframework.stereotype.Component;

@Component
public class InventoryMapper {
    public InventoryMovement toEntity(InventoryMovementRequest request) {
        return InventoryMovement.builder()
                .movementType(request.movementType())
                .quantity(request.quantity())
                .build();
    }

    public InventoryMovementResponse toResponse(InventoryMovement inventoryMovement) {
        return InventoryMovementResponse.builder()
                .id(inventoryMovement.getId())
                .movementType(inventoryMovement.getMovementType())
                .quantity(inventoryMovement.getQuantity())
                .productId(inventoryMovement.getInventory().getProduct().getId())
                .productName(inventoryMovement.getInventory().getProduct().getName())
                .inventoryId(inventoryMovement.getInventory().getId())
                .categoryId(inventoryMovement.getInventory().getProduct().getCategory().getId())
                .categoryName(inventoryMovement.getInventory().getProduct().getCategory().getName())
                .unitPrice(inventoryMovement.getInventory().getProduct().getPrice())
                .totalAmount(inventoryMovement.getTotalAmount())
                .build();
    }
}
