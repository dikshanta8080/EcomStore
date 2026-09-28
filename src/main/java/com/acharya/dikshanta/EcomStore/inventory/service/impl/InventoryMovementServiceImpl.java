package com.acharya.dikshanta.EcomStore.inventory.service.impl;

import com.acharya.dikshanta.EcomStore.common.dto.response.PagedResponse;
import com.acharya.dikshanta.EcomStore.common.exceptions.BusinessException;
import com.acharya.dikshanta.EcomStore.common.exceptions.ResourceNotFoundException;
import com.acharya.dikshanta.EcomStore.inventory.dto.request.InventoryMovementRequest;
import com.acharya.dikshanta.EcomStore.inventory.dto.response.InventoryMovementResponse;
import com.acharya.dikshanta.EcomStore.inventory.enums.MovementType;
import com.acharya.dikshanta.EcomStore.inventory.mapper.InventoryMapper;
import com.acharya.dikshanta.EcomStore.inventory.model.Inventory;
import com.acharya.dikshanta.EcomStore.inventory.model.InventoryMovement;
import com.acharya.dikshanta.EcomStore.inventory.repository.InventoryMovementRepository;
import com.acharya.dikshanta.EcomStore.inventory.repository.InventoryRepository;
import com.acharya.dikshanta.EcomStore.inventory.service.InventoryMovementService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InventoryMovementServiceImpl implements InventoryMovementService {
    private final InventoryRepository inventoryRepository;
    private final InventoryMovementRepository inventoryMovementRepository;
    private final InventoryMapper inventoryMapper;


    @Override
    @Transactional
    public InventoryMovementResponse createInventoryMovement(InventoryMovementRequest request) {

        Inventory inventory = findInventoryByProductId(request.productId());
        InventoryMovement inventoryMovement = new InventoryMovement();
        if (request.movementType() == MovementType.IN) {
            increaseStock(request, inventoryMovement, inventory);

        } else {
            decreaseStock(request, inventory, inventoryMovement);
        }
        inventoryMovement.setUnitPrice(inventory.getProduct().getPrice());
        inventoryMovement.setQuantity(request.quantity());
        inventoryMovement.calculateTotalAmount();
        inventory.addInventoryMovement(inventoryMovement);
        return inventoryMapper.toResponse(inventoryMovement);

    }

    @Override
    public InventoryMovementResponse getInventoryMovement(Long id) {
        return null;
    }

    @Override
    public InventoryMovementResponse deleteInventoryMovement(Long id) {
        return null;
    }

    @Override
    public PagedResponse<InventoryMovementResponse> getAllInventoryMovements(Pageable pageable) {
        return null;
    }

    private Inventory findInventoryByProductId(Long productId) {
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));
    }

    private InventoryMovement findInventoryMovementById(Long id) {
        return inventoryMovementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory movement not found"));
    }

    private void increaseStock(InventoryMovementRequest request, InventoryMovement inventoryMovement, Inventory inventory) {
        if (request.quantity() <= 0) {
            throw new IllegalArgumentException("Quantity cannot be less than or equal to 0");
        }
        inventoryMovement.setMovementType(MovementType.IN);
        inventory.updateStock(request.quantity());
    }

    private void decreaseStock(InventoryMovementRequest request, Inventory inventory, InventoryMovement inventoryMovement) {
        if (request.quantity() > inventory.getStock()) {
            throw new BusinessException("Quantity cannot be greater than stock");
        }
        inventoryMovement.setMovementType(MovementType.OUT);
        inventory.reduceStock(request.quantity());
    }

}
