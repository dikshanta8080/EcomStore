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
import org.springframework.data.domain.Page;
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
        inventoryMovementRepository.save(inventoryMovement);
        return inventoryMapper.toResponse(inventoryMovement);

    }

    @Override
    @Transactional(readOnly = true)
    public InventoryMovementResponse getInventoryMovement(Long id) {
        InventoryMovement inventoryMovement = findInventoryMovementById(id);
        return inventoryMapper.toResponse(inventoryMovement);
    }

    @Transactional
    @Override
    public InventoryMovementResponse deleteInventoryMovement(Long id) {
        InventoryMovement inventoryMovement = findInventoryMovementById(id);
        inventoryMovementRepository.delete(inventoryMovement);
        return inventoryMapper.toResponse(inventoryMovement);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<InventoryMovementResponse> getAllInventoryMovements(Pageable pageable) {
        Page<InventoryMovement> inventoryMovements = inventoryMovementRepository.findAll(pageable);
        Page<InventoryMovementResponse> response = inventoryMovements.map(inventoryMapper::toResponse);
        return PagedResponse.from(response);
    }

    private Inventory findInventoryByProductId(Long productId) {
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product inventory not found"));
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
