package com.acharya.dikshanta.retail_store.inventory.service;

import com.acharya.dikshanta.retail_store.common.dto.response.PagedResponse;
import com.acharya.dikshanta.retail_store.inventory.dto.request.InventoryMovementFilterRequest;
import com.acharya.dikshanta.retail_store.inventory.dto.request.InventoryMovementRequest;
import com.acharya.dikshanta.retail_store.inventory.dto.response.InventoryMovementResponse;
import org.springframework.data.domain.Pageable;

public interface InventoryMovementService {
    InventoryMovementResponse createInventoryMovement(InventoryMovementRequest request);

    InventoryMovementResponse getInventoryMovement(Long id);

    InventoryMovementResponse deleteInventoryMovement(Long id);

    default PagedResponse<InventoryMovementResponse> getAllInventoryMovements(Pageable pageable) {
        return getAllInventoryMovements(pageable, null);
    }

    PagedResponse<InventoryMovementResponse> getAllInventoryMovements(Pageable pageable, InventoryMovementFilterRequest filterRequest);
}
